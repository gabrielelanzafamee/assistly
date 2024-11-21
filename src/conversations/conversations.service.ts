import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './entities/conversation.entity';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationStatus, ConversationType } from 'src/core/enums/conversation.enum';
import { CreateConversationDto } from './dto/create-conversation.dto';


@Injectable()
export class ConversationsService {
	constructor(
		@InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
	) {}

	async list(organizationId: string, pagination = null) {
		if (pagination !== null) {
			return await this.conversationModel.find({ organization: organizationId }).skip(pagination.offset).limit(pagination.limit).populate(['organization', 'assistant', 'phone']);
		}
		return await this.conversationModel.find({ organization: organizationId }).populate(['organization', 'assistant', 'phone']);
  }

	async count(organizationId: string) {
		return await this.conversationModel.countDocuments({ organization: organizationId });
	}

	async create(conversation: CreateConversationDto): Promise<ConversationDocument> {
		return await new this.conversationModel(conversation).save();
	}

	async update(conversationId, organizationId, data: UpdateConversationDto) {
		return await this.conversationModel.updateOne({ _id: conversationId, organization: organizationId }, data);
	}

	async get(id: string, organizationId: string): Promise<ConversationDocument> {
		return await this.conversationModel.findOne({ _id: id, organization: organizationId });
	}

	async delete(id: string, organizationId: string) {
		return await this.conversationModel.deleteOne({ _id: id, organization: organizationId });
	}

	async getByAssistantAndFrom(assistantId: string, from: string, organizationId: string): Promise<ConversationDocument> {
		return (await this.conversationModel.findOne({ assistant: assistantId, from, organization: organizationId })).populate([
			'organization',
			'assistant',
			'phone'
		]);
	}

	async getConversationTwilio(from: string, phone: string, type: ConversationType): Promise<ConversationDocument> {
		return await this.conversationModel.findOne({ type, from, phone }).populate(['phone', 'organization', 'assistant']);
	}

	async getConversationOrCreate(params: CreateConversationDto): Promise<ConversationDocument> {
		const conversation = await this.getConversationTwilio(params.from, params.phone, params.type);
		if (conversation) return conversation;

		return await this.create({
			organization: params.organization,
			assistant: params.assistant,
			phone: params.phone,
			from: params.from,
			type: params.type,
			status: ConversationStatus.ACTIVE
		});
	}
}

