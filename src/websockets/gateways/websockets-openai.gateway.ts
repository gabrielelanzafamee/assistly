import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as WebSocket from 'ws';

import { AssistantsService } from 'src/assistants/assistants.service';
import { assertion } from 'src/core/utils/common.util';
import { randomUUID } from 'crypto';
import { WSClientData } from 'src/core/interfaces/websocket-client.interface';
import { CallStatus } from 'src/core/enums/call.enum';
import { WebsocketsOpenaiService } from '../services/websockets-openai.service';

@WebSocketGateway({
	path: '/ws/v1/openai',
})
export class WebsocketsOpenAIGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server!: WebSocket.Server;
	private clients = new Map<string, WSClientData>();

	constructor(
		private readonly websocketsService: WebsocketsOpenaiService,
		private readonly assistansService: AssistantsService,
	) {}

	afterInit() {}

	handleConnection(client: WebSocket, ...args: any[]) {
		const clientId = randomUUID().toString();
		client['id'] = clientId;
		const openaiWS = this.websocketsService.connectToRealtimeWS();
		this.clients.set(clientId, {
			callSid: null,
			callId: null,
			streamSid: null,
			instructions: null,
			ws: client,
			openaiWS: openaiWS
		});
		this.websocketsService.updateClient(clientId, {
			callId: null,
			callSid: null,
			streamSid: null,
			organizationId: null,
			phoneNumber: null,
			instructions: null,
			messages: [],
			ws: client,
			openaiWS: openaiWS
		});
	}

	handleDisconnect(client: WebSocket) {
		const clientId = client['id'];
		const clientData = this.clients.get(clientId);

		if (!clientData) return;

		clientData.openaiWS.close();
		this.websocketsService.callsService.update(clientData.callId, clientData.organizationId, { status: CallStatus.COMPLETED});
		this.clients.delete(clientId);
		this.websocketsService.removeClient(clientId);
	}

	@SubscribeMessage('start')
	async handleStart(
		@ConnectedSocket() client: WebSocket,
		@MessageBody() data: any,
	) {
		const clientId = client['id'];
		const clientData = this.clients.get(clientId);

		assertion(clientData, new InternalServerErrorException("No client data found."))

		const openaiWS = clientData.openaiWS;

		const { streamSid, callSid } = data.start;
		const { phoneId, phoneNumber, organizationId, callId } = data.start.customParameters;

		const assistant = await this.assistansService.getByPhoneId(
			phoneId,
			organizationId,
		);
		assertion(assistant, new BadRequestException('Assistant not found'));

		this.clients.set(clientId, {
			callId,
			callSid,
			streamSid,
			organizationId,
			phoneNumber,
			instructions: assistant.instructions,
			messages: [{ role: 'system', content: assistant.instructions }],
			ws: client,
			openaiWS: openaiWS,
		});

		this.websocketsService.updateClient(clientId, this.clients.get(clientId));
		this.websocketsService.initOpenAISession(clientId);

		// update status
		await this.websocketsService.callsService.update(client.callId, client.organizationId, { status: CallStatus.IN_PROGRESS })
	}

	@SubscribeMessage('media')
	handleMedia(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
		const clientId = client['id'];
		this.websocketsService.sendTwilioMediaInput(clientId, data.media.payload);
	}

	@SubscribeMessage('mark')
	handleMark(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
		const label = data.mark.name;
		console.log(`Mark event received: ${label}`);
	}

	@SubscribeMessage('stop')
	handleStop(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
		const clientId = client['id'];
		const clientData = this.clients.get(clientId);

		if (!clientData) return ;

		this.websocketsService.callsService.update(clientData.callId, clientData.organizationId, { status: CallStatus.COMPLETED });
		this.websocketsService.stopSession(clientId);
		this.clients.delete(clientId);
	}
}
