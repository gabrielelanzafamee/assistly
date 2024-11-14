import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { Buffer } from 'buffer';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class TranscriptionService {
	private dgConnection: any;
	private finalResult: string;
	private speechFinal: boolean;
	private startTime: number;
	private endTime: number;
	private deepgram: any;

	constructor(
		public eventEmitter: EventEmitter2,
		public configService: ConfigService
	) {
		this.deepgram = createClient(this.configService.getSystemConfig().deepgram.DEEPGRAM_API_KEY);
	}

	async start(clientId: string) {
		this.dgConnection = this.deepgram.listen.live({
			encoding: 'mulaw',
			sample_rate: 8000,
			language: 'multi',
			model: this.configService.getSystemConfig().deepgram.DEEPGRAM_MODEL,
			punctuate: true,
			interim_results: true,
			endpointing: 200,
			utterance_end_ms: 1000,
		});

		this.finalResult = '';
		this.speechFinal = false; // used to determine if we have seen speech_final=true indicating that deepgram detected a natural pause in the speakers speech.
		this.startTime = new Date().getTime();
		this.endTime = new Date().getTime();

		this.dgConnection.on(LiveTranscriptionEvents.Open, () => {
			console.log('STT -> Deepgram connection opened');
			this.dgConnection.on(
				LiveTranscriptionEvents.Transcript,
				(transcriptionEvent) => {
					const alternatives = transcriptionEvent.channel?.alternatives;
					let text = '';
					let confidence = 0.0;

					if (alternatives) {
						text = alternatives[0]?.transcript;
						confidence = alternatives[0]?.confidence;
					}

					// if we receive an UtteranceEnd and speech_final has not already happened then we should consider this the end of of the human speech and emit the transcription
					if (transcriptionEvent.type === 'UtteranceEnd') {
						if (!this.speechFinal) {
							console.log(
								`UtteranceEnd received before speechFinal, emit the text collected so far: ${this.finalResult}`,
							);
							this.endTime = new Date().getTime();
							this.eventEmitter.emit(
								'transcription.complete',
								clientId,
								this.finalResult,
								confidence,
								this.startTime,
								this.endTime,
							);
							this.startTime = new Date().getTime();
							return;
						} else {
							console.log(
								'STT -> Speech was already final when UtteranceEnd recevied',
							);
							return;
						}
					}

					// console.log(text, "is_final: ", transcription?.is_final, "speech_final: ", transcription.speech_final);
					// if is_final that means that this chunk of the transcription is accurate and we need to add it to the finalResult
					if (transcriptionEvent.is_final === true && text.trim().length > 0) {
						console.log(
							`Deepgram Result: ${text.trim().length} - ${
								transcriptionEvent.is_final
							} - ${
								transcriptionEvent.speech_final
							} - Confidence: ${confidence}`,
						);
						this.finalResult += ` ${text}`;
						// if speech_final and is_final that means this text is accurate and it's a natural pause in the speakers speech. We need to send this to the assistant for processing
						if (transcriptionEvent.speech_final === true) {
							this.speechFinal = true; // this will prevent a utterance end which shows up after speechFinal from sending another response
							this.endTime = new Date().getTime();
							this.eventEmitter.emit(
								'transcription.complete',
								clientId,
								this.finalResult,
								confidence,
								this.startTime,
								this.endTime,
							);
							this.startTime = new Date().getTime();
							this.finalResult = '';
						} else {
							// if we receive a message without speechFinal reset speechFinal to false, this will allow any subsequent utteranceEnd messages to properly indicate the end of a message
							this.speechFinal = false;
						}
					} else {
						this.eventEmitter.emit('transcription.utterance', clientId, text, confidence);
					}
				},
			);

			this.dgConnection.on(LiveTranscriptionEvents.Error, (error) => {
				console.error('STT -> deepgram error');
				console.error(JSON.stringify(error));
			});

			this.dgConnection.on(LiveTranscriptionEvents.Metadata, (metadata) => {
				console.log('STT -> deepgram metadata');
				console.log(JSON.stringify(metadata));
			});

			this.dgConnection.on(LiveTranscriptionEvents.Close, () => {
				console.log('STT -> Deepgram connection closed');
			});
		});
	}

	/**
	 * Send the payload to Deepgram
	 * @param {String} payload A base64 MULAW/8000 audio stream
	 */
	send(payload) {
		if (this.dgConnection.getReadyState() === 1) {
			const buffer = Buffer.from(payload, 'base64');
			this.dgConnection.send(buffer);
		}
	}
}
