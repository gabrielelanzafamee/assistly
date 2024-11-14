import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import mongoose from 'mongoose';
import { CallsService } from 'src/calls/calls.service';
import { KnowledgesService } from 'src/knowledges/knowledges.service';
import { CallStatus } from 'src/core/enums/call.enum';
import { WSClientData } from 'src/core/interfaces/websocket-client.interface';
import { StreamService } from 'src/core/services/stream.service';
import { TranscriptionService } from 'src/core/services/transcription.service';
import { TextToSpeechService } from 'src/core/services/tts.service';
import { OpenAIService } from 'src/core/openai/services/openai.service';

@Injectable()
export class WebsocketsCustomService {
  private clients: Map<string, WSClientData>;
  private marks: any[];
  private iterationCount: number;

  constructor(
    public readonly eventEmitter: EventEmitter2,
    public readonly transcriptionService: TranscriptionService,
    public readonly openaiService: OpenAIService,
    public readonly streamService: StreamService,
    public readonly textToSpeechService: TextToSpeechService,
		public readonly callsService: CallsService,
		public readonly knowledgesService: KnowledgesService
  ) {
    this.clients = new Map<string, WSClientData>();
    this.marks = [];
    this.iterationCount = 0;
  }

  updateClient(clientId: string, client: WSClientData) {
    this.clients.set(clientId, client);
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId);
  }

  @OnEvent('call.start')
  async handleCallStart(clientId: string) {
		const client = this.clients.get(clientId);
		await this.transcriptionService.start(clientId);
		await this.callsService.update(client.callId, client.organizationId, { status: CallStatus.IN_PROGRESS })
		await this.eventEmitter.emit('openai.generation', clientId, {
			partialResponse: 'Hello there, who is calling?',
			time: 0,
			partialResponseIndex: 0,
		}, 0);
  }
	
  @OnEvent('transcription.utterance')
  async handleTranscriptionUtterance(clientId: string, text: string, confidence: number) {
		console.log('Transcription utterance', text, confidence);
    if (text?.length > 5 && confidence > 0.9 && this.marks.length > 0) {
			const client = this.clients.get(clientId);
      if (client) {
				this.streamService.sendAudio(clientId, JSON.stringify({
					streamSid: this.streamService.streamSid,
          event: "clear"
        }));
      }
    }
  }

	@OnEvent('transcription.complete')
	async handleTranscriptionComplete(clientId: string, text: string, confidence: number, startTime: number, endTime: number) {
		const client = this.clients.get(clientId);
		if (client) {
			client.messages.push({ role: 'user', content: text });
			this.callsService.addTranscript(client.callId, client.organizationId, 'user', text);
			const query = (await this.openaiService.createVector(text)).data[0].embedding;
			const knowledges = (await this.knowledgesService.findWithSimilarities(query, new mongoose.Types.ObjectId(client.organizationId))).map(item => { 
				return { 
					content: item.chunks.content,
					similarity: item.similarity,
					vector: []
				}
			}).flat();
			this.openaiService.chatEventStream(this.iterationCount, client.messages, {}, clientId, knowledges);
		}
	}

  @OnEvent('openai.generation')
  async handleOpenaiGeneration(clientId: string, reply: any, icount: number) {
    const client = this.clients.get(clientId);
    if (client) {
      client.messages.push({ role: 'assistant', content: reply.partialResponse });
			this.callsService.addTranscript(client.callId, client.organizationId, 'bot', reply.partialResponse);
      this.textToSpeechService.generate(reply, reply.time, icount, clientId);
    }
  }

  @OnEvent('tts.audio')
  async handleTTSAudio(clientId: string, responseIndex: number, audio: any, label: string, icount: number) {
    console.log(label, icount);
    this.streamService.buffer(clientId, responseIndex, audio);
  }

  @OnEvent('stream.sent')
  async handleStreamSent(label: string) {
    this.marks.push(label);
  }
}