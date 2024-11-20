import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Message, MessageDocument } from './entities/message.entity';
import { ConversationsService } from 'src/conversations/conversations.service';
import { TwilioService } from 'src/core/services/twilio.service';
import { PhonesService } from 'src/phones/phones.service';
import { InjectModel } from '@nestjs/mongoose';
import { assertion } from 'src/core/utils/common.util';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageStatus, MessageType } from 'src/core/enums/message.enum';
import { ITwilioSmsCallback, ITwilioWhatsappCallback } from 'src/core/interfaces/twilio.interface';
import { ConversationType } from 'src/core/enums/conversation.enum';



@Injectable()
export class MessagesService {
  constructor(
		@InjectModel(Message.name) private readonly messageModel: Model<Message>,
		private readonly conversationsService: ConversationsService,
		private readonly phonesService: PhonesService,
		private readonly twilioService: TwilioService,
	) {}
	
	async list(organizationId): Promise<MessageDocument[]> {
		return await this.messageModel.find({ organization: organizationId });
	}

	async listByConversation(conversationId: string, organizationId: string): Promise<MessageDocument[]> {
		// list of messages by conversation in order
		return await this.messageModel.find({ conversation: conversationId, organization: organizationId }).sort({ createdAt: 1 });
	}

	async create(message: CreateMessageDto): Promise<MessageDocument> {
		return await new this.messageModel(message).save();
	}

	async get(id: string, organizationId: string): Promise<MessageDocument> {
		return await this.messageModel.findOne({ _id: id, organization: organizationId });
	}

	async delete(id: string, organizationId: string) {
		return await this.messageModel.deleteOne({ _id: id, organization: organizationId });
	}

	async reply(to: string, text: string, conversationId: string, organizationId: string, paramsTwilio: ITwilioSmsCallback | ITwilioWhatsappCallback | null = null): Promise<MessageDocument> {
		if (to.startsWith('whatsapp:')) {
			assertion(this.twilioService.isE164(to.split(':').at(-1)), new BadRequestException('Invalid phone number'));
		} else {
			assertion(this.twilioService.isE164(to), new BadRequestException('Invalid phone number'));
		}

		const conversation = await this.conversationsService.get(conversationId, organizationId);
		assertion(conversation, new NotFoundException('Conversation not found'));

		const phone = await this.phonesService.get(conversation.phone, organizationId);
		assertion(phone, new NotFoundException('Phone number not found'));

		await this.twilioService.sendMessage({
			body: text,
			to: to,
			from: conversation.type === ConversationType.WHATSAPP ? `whatsapp:${phone.phoneNumber}` : phone.phoneNumber
		}, phone.organization._id.toString());

		const messageObject = {
			organization: organizationId,
			conversation: conversationId,
			phoneNumber: phone.phoneNumber,
			messageSid: paramsTwilio.MessageSid,
			content: text,
			type: MessageType.OUTBOUND,
			status: MessageStatus.ACCEPTED
		};

		if ('WaId' in paramsTwilio) {
			messageObject['waId'] = paramsTwilio.WaId;
		}

		return await this.create(messageObject as CreateMessageDto);
	}

	async send(conversationId: string, organizationId: string, body: { content: string }): Promise<MessageDocument> {
		const conversation = await this.conversationsService.get(conversationId, organizationId);
		assertion(conversation, new NotFoundException('Conversation not found'));

		const phone = await this.phonesService.get(conversation.phone, organizationId);
		assertion(phone, new NotFoundException('Phone number not found'));

		let twilioFrom = phone.phoneNumber;
		let twilioTo = conversation.from;

		if (conversation.type === ConversationType.WHATSAPP) {
			twilioFrom = `whatsapp:${phone.phoneNumber}`;
			twilioTo = `whatsapp:${conversation.from}`;
		}

		console.log({
			body: body.content,
			to: twilioTo,
			from: twilioFrom
		})

		await this.twilioService.sendMessage({
			body: body.content,
			to: twilioTo,
			from: twilioFrom
		}, organizationId);

		const messageObject = {
			organization: organizationId,
			conversation: conversationId,
			phoneNumber: phone.phoneNumber,
			messageSid: null,
			content: body.content,
			type: MessageType.OUTBOUND,
			status: MessageStatus.ACCEPTED
		};

		return await this.create(messageObject as CreateMessageDto);
	}
}

// for whatsapp I need to build a workflow that will allow me to first to activate it
// a form in the assistant app will works, for now only phone and sms