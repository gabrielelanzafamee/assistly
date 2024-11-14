import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { BadRequestException } from '@nestjs/common';
import { WebsocketsCustomService } from '../services/websockets-custom.service';
import { AssistantsService } from 'src/assistants/assistants.service';
import { assertion } from 'src/core/utils/common.util';
import { randomUUID } from 'crypto';
import { WebSocket } from 'ws';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WSClientData } from 'src/core/interfaces/websocket-client.interface';
import { CallStatus } from 'src/core/enums/call.enum';
import { CallsService } from 'src/calls/calls.service';


@WebSocketGateway({
  path: '/ws/v1/custom',
})
export class WebsocketsCustomGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: WebSocket.Server;
  private clients = new Map<string, WSClientData>();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly websocketsService: WebsocketsCustomService,
    private readonly assistansService: AssistantsService,
		private readonly callsService: CallsService
  ) {}

  afterInit() {}

  handleConnection(client: WebSocket, ...args: any[]) {
    const clientId = randomUUID().toString();
    client['id'] = clientId;
    this.clients.set(clientId, { callSid: null, callId: null, streamSid: null, instructions: null, ws: client });
    this.websocketsService.updateClient(clientId, {
      callId: null,
      callSid: null,
      streamSid: null,
      organizationId: null,
      phoneNumber: null,
      instructions: null,
      messages: [],
      ws: client
    });
  }

  handleDisconnect(client: WebSocket) {
    const clientId = client['id'];
		const clientData = this.clients.get(clientId);

		if (!clientData) return ;

		this.callsService.update(clientData.callId, clientData.organizationId, {
			status: CallStatus.COMPLETED
		});
		this.clients.delete(clientId);
    this.websocketsService.streamService.removeWs(clientId);
    this.websocketsService.removeClient(clientId);
  }

  @SubscribeMessage('start')
  async handleStart(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
    const clientId = client['id'];
    const { streamSid, callSid } = data.start;
		const { phoneId, phoneNumber, organizationId, callId } = data.start.customParameters;
    const assistant = await this.assistansService.getByPhoneId(phoneId, organizationId);
    assertion(assistant, new BadRequestException('Assistant not found'));

    this.clients.set(clientId, {
			callId,
      callSid,
      streamSid,
      organizationId,
      phoneNumber,
      instructions: assistant.instructions,
      messages: [
        { role: 'system', content: assistant.instructions }
      ],
      ws: client
    });
    this.websocketsService.streamService.setStreamSid(streamSid);
    this.websocketsService.streamService.setWs(clientId, client);
    this.websocketsService.updateClient(clientId, {
			callId,
      callSid,
      streamSid,
      organizationId,
      phoneNumber,
      instructions: assistant.instructions,
      messages: [
        { role: 'system', content: assistant.instructions }
      ],
      ws: client
    });
    this.eventEmitter.emit('call.start', clientId);
  }

  @SubscribeMessage('media')
  handleMedia(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
    const clientId = client['id'];
    const clientData = this.clients.get(clientId);
    assertion(clientData, new BadRequestException('Client data not found'));
    this.websocketsService.transcriptionService.send(data.media.payload);
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
    assertion(clientData, new BadRequestException('Client data not found'));
		this.callsService.update(clientData.callId, clientData.organizationId, {
			status: CallStatus.COMPLETED
		});
		this.clients.delete(clientId);
    this.websocketsService.streamService.removeWs(clientId);
    this.websocketsService.removeClient(clientId);
  }
}