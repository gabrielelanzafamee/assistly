import * as twilio from 'twilio';
import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AssistantsService } from 'src/assistants/assistants.service';
import { CallsService } from 'src/calls/calls.service';
import { ConversationsService } from 'src/conversations/conversations.service';
import { KnowledgesService } from 'src/knowledges/knowledges.service';
import { MessagesService } from 'src/messages/messages.service';
import { PhonesService } from 'src/phones/phones.service';
import { AssistantType } from 'src/core/enums/assistant.enum';
import { CallStatus } from 'src/core/enums/call.enum';
import { ConversationType } from 'src/core/enums/conversation.enum';
import { MessageStatus, MessageType } from 'src/core/enums/message.enum';
import { ITwilioSmsCallback, ITwilioVoiceCallback, ITwilioVoiceStatusCallback, ITwilioWhatsappCallback, ITwilioWhatsappStatusCallback } from 'src/core/interfaces/twilio.interface';
import { assertion } from 'src/core/utils/common.util';
import { OpenAIService } from 'src/core/openai/services/openai.service';
// import { ToolsService } from 'src/tools/tools.service';
import { AssistantDocument } from 'src/assistants/entities/assistant.entity';
import { ConversationDocument } from 'src/conversations/entities/conversation.entity';
import { PhoneDocument } from 'src/phones/entities/phone.entity';

@Injectable()
export class WebhooksService {
  constructor(
		private readonly openaiService: OpenAIService,
		private readonly conversationsService: ConversationsService,
		private readonly assistantsService: AssistantsService,
		private readonly phonesService: PhonesService,
		private readonly messagesService: MessagesService,
		private readonly callsService: CallsService,
		// private readonly toolsService: ToolsService,
		private readonly knowledgesService: KnowledgesService
	) {}

	private async getAssistantAndPhone(phoneId: string, assistantType: AssistantType) {
		console.log(phoneId)
    const phone = await this.phonesService.getById(phoneId);
    assertion(phone, new NotFoundException('Phone not found'));

    const assistant = await this.assistantsService.getByPhoneId(phone._id.toString(), phone.organization._id.toString());
    assertion(assistant, new NotFoundException('Assistant not found'));
    assertion([assistantType, AssistantType.ALL].includes(assistant.type), new ForbiddenException("No resource"));

    return { phone, assistant };
  }

  private async handleInactiveAssistant(conversation: any, from: string, body: string, smsStatus: string, messageSid: string, params: any) {
    await this.messagesService.create({
      organization: conversation.organization,
      conversation: conversation._id,
      messageSid,
      phoneNumber: from,
      content: body,
      type: MessageType.INBOUND,
      status: MessageStatus[smsStatus.toUpperCase()]
    });

    await this.messagesService.reply(
      from, 
      'Sorry, we are offline. Try later.', 
      conversation._id, 
      conversation.organization, 
      params
    );
  }

  private async createInboundMessage(organizationId: string, conversationId: string, messageSid: string, from: string, body: string, smsStatus: string) {
    await this.messagesService.create({
      organization: organizationId,
      conversation: conversationId,
      messageSid,
      phoneNumber: from,
      content: body,
      type: MessageType.INBOUND,
      status: MessageStatus[smsStatus.toUpperCase()]
    });
  }

  private async reply(body: string, assistant: AssistantDocument, conversation: ConversationDocument, phone: PhoneDocument, history: any[], from: string, params: any) {
    const messages = [
      { role: 'system', content: assistant.instructions },
      ...history.map(m => ({ role: m.type === 'inbound' ? 'user' : 'assistant', content: m.content })),
      { role: 'user', content: body }
    ];

    const query = (await this.openaiService.createVector(body)).data[0].embedding;
    const knowledges = (await this.knowledgesService.findWithSimilarities(query, phone.organization._id, assistant.knowledge))
      .map(item => ({ content: item.chunks.content, similarity: item.similarity, vector: [] }));
		// const tools = (await this.toolsService.findWithSimilarities(query, assistant.organization._id, assistant._id, 1)).map(item => ({ name: item.name, description: item.description, endpoint: item.endpoint, endpointApiKey: item.endpointApiKey, similarity: item.similarity }));
		
		// response
    let finalContent = '';

		// get phone number from the from and check if it is a whatsapp number
		const isWhatsapp = from.includes('whatsapp:');
		const functionContext = {
			phoneNumber: isWhatsapp ? from.split(':').at(-1) : from,
			organizationId: phone.organization._id.toString()
		}

    var inputTotalTokens = 0; // use tiktoken to save total number
    var outputTotalTokens = 0;

		for await (const chunk of this.openaiService.streamChatCompletion(messages, {}, knowledges, null, functionContext)) {
      outputTotalTokens += 1;

      if (chunk.content) {
        finalContent += chunk.content;
      }
    }

    // save openai usage
    
    await this.messagesService.reply(from, finalContent, conversation._id.toString(), phone.organization._id.toString(), params);
  }

	async callbackSms(params: ITwilioSmsCallback, phoneId: string) {
		const messageSid = params.MessageSid;
		const smsStatus = params.SmsStatus;
		const from = params.From;
		const body = params.Body;

		const { assistant, phone } = await this.getAssistantAndPhone(phoneId, AssistantType.SMS);

		const conversation = await this.conversationsService.getConversationOrCreate({
			organization: phone.organization._id.toString(),
			assistant: assistant._id.toString(),
			phone: phone._id.toString(),
			from: from,
			type: ConversationType.SMS
		});

		if (!assistant.isActive) {
			await this.handleInactiveAssistant(conversation, from, body, smsStatus, messageSid, params);
		}

		await this.createInboundMessage(phone.organization._id.toString(), conversation._id.toString(), params.MessageSid, params.From, params.Body, params.SmsStatus);

		if (!conversation.automaticReply) return true;

		const history = await this.messagesService.listByConversation(conversation._id.toString(), phone.organization._id.toString());
		await this.reply(params.Body, assistant, conversation, phone, history, params.From, params);

		return true;
	}

	async callbackWhatsapp(params: ITwilioWhatsappCallback, phoneId: string) {
		const { phone, assistant } = await this.getAssistantAndPhone(phoneId, AssistantType.WHATSAPP);
    const conversation = await this.conversationsService.getConversationOrCreate({
      organization: phone.organization._id.toString(),
      assistant: assistant._id.toString(),
      phone: phone._id.toString(),
      from: params.From.split(':').at(-1),
      type: ConversationType.WHATSAPP
    });

    if (!assistant.isActive) {
      await this.handleInactiveAssistant(conversation, params.From, params.Body, params.SmsStatus, params.MessageSid, params);
      return true;
    }

    await this.createInboundMessage(phone.organization._id.toString(), conversation._id.toString(), params.MessageSid, params.From, params.Body, params.SmsStatus);

    if (!conversation.automaticReply) return true;

    const history = await this.messagesService.listByConversation(conversation._id.toString(), phone.organization._id.toString());
    await this.reply(params.Body, assistant, conversation, phone, history, params.From, params);

    return true;
	}

	async callbackCall(params: ITwilioVoiceCallback, phoneId: string) {
		const response = new twilio.twiml.VoiceResponse();
    const { phone, assistant } = await this.getAssistantAndPhone(phoneId, AssistantType.CALL);

		// check how many calls and rmeove them
		const calls = await this.callsService.getCallsByStatus(params.From, phone.organization._id.toString(), CallStatus.IN_PROGRESS);
		assertion(calls < 5, new ForbiddenException("Calls full at the moment."));

		if (calls >= 5) {
			response.say("The line is busy at the moment, try later.");
			return response.toString();
		}

    const call = await this.callsService.create({
      organization: phone.organization._id.toString(),
      assistant: assistant._id.toString(),
      phone: phone._id.toString(),
      callSid: params.CallSid,
      from: params.From,
      to: params.To,
      transcript: [],
      status: CallStatus.QUEUED
    });
    assertion(call, new InternalServerErrorException('Unable to start a call'));

    if (!assistant.isActive) {
      response.say("I'm sorry but at the moment we are offline. Try Later.");
      return response.toString();
    }

    const connect = response.connect();
    const stream = connect.stream({
      url: `${process.env.BASE_URL.replace('https', 'wss')}/ws/v1/openai`,
    });

    stream.parameter({ name: 'callId', value: call._id.toString() });
    stream.parameter({ name: 'callSid', value: params.CallSid });
    stream.parameter({ name: 'from', value: params.From });
    stream.parameter({ name: 'phoneId', value: phone._id.toString() });
    stream.parameter({ name: 'phoneNumber', value: params.To });
    stream.parameter({ name: 'organizationId', value: phone.organization._id.toString() });

    return response.toString();
	}

	async fallbackSms(params: ITwilioSmsCallback, phoneId: string) {
    const { phone, assistant } = await this.getAssistantAndPhone(phoneId, AssistantType.SMS);
    const conversation = await this.conversationsService.getConversationOrCreate({
      organization: phone.organization._id.toString(),
      assistant: assistant._id.toString(),
      phone: phone._id.toString(),
      from: params.From,
      type: ConversationType.SMS
    });

    await this.messagesService.reply(params.To, 'Sorry, I am not available right now.', conversation._id.toString(), phone.organization._id.toString(), params);

    return true;
  }

  async fallbackCall(params: ITwilioVoiceCallback, phoneId: string) {
    const response = new twilio.twiml.VoiceResponse();
    response.say('Sorry, I am not available right now.');
    return response.toString();
  }

  async callbackStatus(params: ITwilioVoiceStatusCallback, phoneId: string) {
		const { CallbackSource, AccountSid, From } = params;

    const { phone } = await this.getAssistantAndPhone(phoneId, AssistantType.SMS);
    const call = await this.callsService.getCallTwilio(From, phone._id.toString(), phone.organization._id.toString());
		
		// update status
		await this.callsService.update(call._id.toString(), call.organization._id.toString(), {
			status: CallStatus[params.CallStatus.toUpperCase().replace('-', '_')]
		});

    return true;
  }

  async callbackWhatsappStatus(params: ITwilioWhatsappStatusCallback, phoneId: string) {
    return true;
  }
}