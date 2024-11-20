import * as WebSocket from 'ws';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CallsService } from 'src/calls/calls.service';
import { KnowledgesService } from 'src/knowledges/knowledges.service';
import { WSClientData } from 'src/core/interfaces/websocket-client.interface';
import { ConfigService } from 'src/core/config/config.service';

// save utilisation here


@Injectable()
export class WebsocketsOpenaiService {
	private clients: Map<string, WSClientData>;

	constructor(
		public readonly eventEmitter: EventEmitter2,
		public readonly callsService: CallsService,
		public readonly configService: ConfigService,
		public readonly knowledgesService: KnowledgesService
	) {
		this.clients = new Map<string, WSClientData>();
	}

	updateClient(clientId: string, client: WSClientData) {
		this.clients.set(clientId, client);
	}

	removeClient(clientId: string) {
		this.clients.delete(clientId);
	}

	initOpenAISession(clientId: string) {
		const client = this.clients.get(clientId);
		if (!client) return ;

		client.openaiWS.on('open', () => {
			setTimeout(
				() => this.sendSessionUpdate(clientId, client.instructions),
				250
			);
		});

		client.openaiWS.on('message', (data) => {
			try {
				const response = JSON.parse(data);

				if (response.type === 'session.updated') {
					console.log('Session updated successfully:', response);
				}

				if (response.type === 'response.audio.delta' && response.delta) {
					this.sendTwilioMediaOutput(clientId, response.delta)
				}

				if (response.type === 'conversation.item.input_audio_transcription.completed') {
					this.callsService.addTranscript(client.callId, client.organizationId, 'user', response.transcript);
				}

				if (response.type === 'response.content_part.done') {
					this.callsService.addTranscript(client.callId, client.organizationId, 'bot', response.part.transcript);
				}

				if (response.type === 'response.done') {
					const inputTokens = response.respone.usage.input_tokens;
					const outputTokens = response.respone.usage.output_tokens;



				}
			} catch (error) {
				console.error('Error processing OpenAI message:', error, 'Raw message:', data);
			}
		});

		client.openaiWS.on('close', () => {
			console.log('Disconnected from the OpenAI Realtime API');
			this.clients.delete(clientId);
		});

		client.openaiWS.on('error', (error) => {
			console.error('Error in the OpenAI WebSocket:', error);
			// this.updateClient(clientId, {
			// 	...this.clients.get(clientId),
			// 	openaiWS: client.openaiWS
			// })
		});
	}

	sendTwilioMediaInput(clientId: string, payload: string) {
		const client = this.clients.get(clientId);
		if (!client) return ;

		const event = {
			type: 'input_audio_buffer.append',
			audio: payload
		};

		if (client.openaiWS.readyState !== WebSocket.OPEN) return ;

		client.openaiWS.send(JSON.stringify(event));
	}

	sendTwilioMediaOutput(clientId: string, payload: string) {
		const client = this.clients.get(clientId);
		if (!client) return ;

		const audioDelta = {
			event: 'media',
			streamSid: client.streamSid,
			media: {
				payload: Buffer.from(payload, 'base64').toString('base64'),
			},
		};

		client.ws.send(JSON.stringify(audioDelta));
	}

	stopSession(clientId: string) {
		const client = this.clients.get(clientId);
		if (!client) return ;

		// close openai session
		client.openaiWS.close();
		this.removeClient(clientId);
	}

	sendSessionUpdate(clientId: string, instructions: string) {
		const sessionUpdate = {
			type: 'session.update',
			session: {
				turn_detection: { type: 'server_vad' },
				input_audio_format: 'g711_ulaw',
				output_audio_format: 'g711_ulaw',
				input_audio_transcription: {
            model: "whisper-1"
        },
				voice: 'alloy',
				instructions: instructions,
				modalities: ['text', 'audio'],
				temperature: 0.8,
			},
		};

		const client = this.clients.get(clientId);
		client.openaiWS.send(JSON.stringify(sessionUpdate));
	}

	connectToRealtimeWS() {
    const config = this.configService.getOpenAIConfig();
    const ws = new WebSocket(
      `wss://api.openai.com/v1/realtime?model=gpt-4o-audio-preview-2024-10-01`,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      }
    );
    return ws;
  }
}
