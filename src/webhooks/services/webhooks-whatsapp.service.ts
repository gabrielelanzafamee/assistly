import { Injectable } from '@nestjs/common';
import { AssistantType } from 'src/core/enums/assistant.enum';
import { ConversationType } from 'src/core/enums/conversation.enum';
import {
	ITwilioWhatsappCallback,
	ITwilioWhatsappStatusCallback,
} from 'src/core/interfaces/twilio.interface';
import { WebhooksCommonService } from './webhooks-common.service';

@Injectable()
export class WebhooksWhatsappService {
	constructor(
		private readonly webhooksCommonService: WebhooksCommonService
	) {}

	async callbackWhatsapp(params: ITwilioWhatsappCallback, phoneId: string) {
		const { phone, assistant } = await this.webhooksCommonService.getAssistantAndPhone(
			phoneId,
			AssistantType.WHATSAPP,
		);
		const conversation =
			await this.webhooksCommonService.conversationsService.getConversationOrCreate({
				organization: phone.organization._id.toString(),
				assistant: assistant._id.toString(),
				phone: phone._id.toString(),
				from: params.From.split(':').at(-1),
				type: ConversationType.WHATSAPP,
			});

		if (!assistant.isActive) {
			await this.webhooksCommonService.handleInactiveAssistant(
				conversation,
				params.From,
				params.Body,
				params.SmsStatus,
				params.MessageSid,
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
		await this.webhooksCommonService.usageService.recordUsage(phone.organization._id.toString(), 'twilio', 'whatsapp', 1, { type: 'inbound' });

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

	async callbackWhatsappStatus(
		params: ITwilioWhatsappStatusCallback,
		phoneId: string,
	) {
		return null;
	}
}
