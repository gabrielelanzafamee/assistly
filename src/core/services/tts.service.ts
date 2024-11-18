import { Buffer } from "buffer";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ConfigService } from "../config/config.service";
import { UsageService } from "src/usage/usage.service";

// integrate save utilisation here

@Injectable()
export class TextToSpeechService {
	private nextExpectedIndex: number;
	private speechBuffer: any;
	private config: any;

  constructor(
		private eventEmitter: EventEmitter2,
		private configService: ConfigService,
		private usageService: UsageService
	) {
		this.config = this.configService.getSystemConfig();
		this.nextExpectedIndex = 0;
    this.speechBuffer = {};
	}

  async generate(gptReply, time = 0, icount, clientId: string, organizationId: string) {
    if (!gptReply) {
      return;
    }

    if (typeof gptReply === 'string') {
      gptReply = {
        partialResponseIndex: 0,
        partialResponse: gptReply,
      };
    }

    const { partialResponseIndex, partialResponse } = gptReply;

    try {
      const ttsStartTime = new Date().getTime();

      const outputFormat = 'ulaw_8000';
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.config.elevenlabs.ELEVENLABS_VOICE}/stream?output_format=${outputFormat}&optimize_streaming_latency=4`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.config.elevenlabs.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            accept: 'audio/wav',
          },
          body: JSON.stringify({
            model_id: this.config.elevenlabs.ELEVENLABS_MODEL,
            text: partialResponse,
          }),
        },
      );

      if (!response.ok) {
        console.error(`Failed to fetch TTS: ${response.statusText}`);
        return;
      }

      // const reader = response.body.getReader();
      // let done, value;
      // let audioBuffer = [];

      // while (!done) {
      //   ({ done, value } = await reader.read());
      //   if (value) {
      //     audioBuffer.push(value);
      //     if (audioBuffer.length >= 5) {
			// 			this.eventEmitter.emit('tts.audio', Buffer.concat(audioBuffer).toString('base64'), icount);
      //       audioBuffer = [];
      //     }
      //   }
      // }

      // // Send any remaining audio in the buffer
      // if (audioBuffer.length > 0) {
			// 	this.eventEmitter.emit('tts.audio', Buffer.concat(audioBuffer).toString('base64'), icount);
      // }

			const blob = await response.blob();
			const buffer = await blob.arrayBuffer();
			const audio = Buffer.from(buffer).toString('base64');
			this.eventEmitter.emit('tts.audio', clientId, partialResponseIndex, audio, partialResponse, icount);
			
			if (organizationId) {
				await this.usageService.recordUsage(
					organizationId,
					'elevenlabs',
					'characters',
					partialResponse.length
				);
			}
		
      const ttsEndTime = new Date().getTime();

      console.log(`TTS -> Audio generated in ${ttsEndTime - ttsStartTime}ms`);
      console.log(`AI: ${partialResponse} | TTS: ${ttsEndTime - ttsStartTime}ms GPT: ${time}ms`);
      console.log(`Interaction ${partialResponseIndex}: TTS -> TWILIO: ${partialResponse}`);
    } catch (err) {
      console.error('Error occurred in TextToSpeech service');
      console.error(err);
    }
  }
}