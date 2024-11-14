import * as WebSocket from 'ws';

export interface WSClientData {
	streamSid: string;
	callSid: string;
	callId: string;
	instructions?: string;
	organizationId?: string;
	phoneNumber?: string;
	messages?: { role: string, content: string }[];
	ws?: WebSocket;
	openaiWS?: WebSocket;
}