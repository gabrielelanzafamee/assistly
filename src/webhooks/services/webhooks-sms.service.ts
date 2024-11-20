import { Injectable } from '@nestjs/common';
import { AssistantType } from 'src/core/enums/assistant.enum';
import { ConversationType } from 'src/core/enums/conversation.enum';
import { ITwilioSmsCallback } from 'src/core/interfaces/twilio.interface';
import { WebhooksCommonService } from './webhooks-common.service';

@Injectable()
export class WebhooksSmsService {
	constructor(
		private readonly webhooksCommonService: WebhooksCommonService
	) {}

	async callbackSms(params: ITwilioSmsCallback, phoneId: string) {
		const messageSid = params.MessageSid;
		const smsStatus = params.SmsStatus;
		const from = params.From;
		const body = params.Body;

		const { assistant, phone } = await this.webhooksCommonService.getAssistantAndPhone(
			phoneId,
			AssistantType.SMS,
		);

		const conversation =
			await this.webhooksCommonService.conversationsService.getConversationOrCreate({
				organization: phone.organization._id.toString(),
				assistant: assistant._id.toString(),
				phone: phone._id.toString(),
				from: from,
				type: ConversationType.SMS,
			});

		if (!assistant.isActive) {
			await this.webhooksCommonService.handleInactiveAssistant(
				conversation,
				from,
				body,
				smsStatus,
				messageSid,
				params,
			);
			return true;
		}

		await this.webhooksCommonService.createInboundMessage(
			phone.organization._id.toString(),
			conversation._id.toString(),
			params.MessageSid,
			params.From,
			params.Body,
			params.SmsStatus,
		);
		await this.webhooksCommonService.usageService.recordUsage(phone.organization._id.toString(), 'twilio', 'sms', 1, { type: 'inbound' });

		if (!conversation.automaticReply) return true;

		const history = await this.webhooksCommonService.messagesService.listByConversation(
			conversation._id.toString(),
			phone.organization._id.toString(),
		);

		await this.webhooksCommonService.reply(
			params.Body,
			assistant,
			conversation,
			phone,
			history,
			params.From,
			params,
		);

		return true;
	}

	async fallbackSms(params: ITwilioSmsCallback, phoneId: string) {
		const { phone, assistant } = await this.webhooksCommonService.getAssistantAndPhone(
			phoneId,
			AssistantType.SMS,
		);
		const conversation =
			await this.webhooksCommonService.conversationsService.getConversationOrCreate({
				organization: phone.organization._id.toString(),
				assistant: assistant._id.toString(),
				phone: phone._id.toString(),
				from: params.From,
				type: ConversationType.SMS,
			});

		await this.webhooksCommonService.messagesService.reply(
			params.To,
			'Sorry, I am not available right now.',
			conversation._id.toString(),
			phone.organization._id.toString(),
			params,
		);

		return true;
	}
}
