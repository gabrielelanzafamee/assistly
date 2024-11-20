import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { AssistantsService } from 'src/assistants/assistants.service';
import { CallsService } from 'src/calls/calls.service';
import { ConversationsService } from 'src/conversations/conversations.service';
import { KnowledgesService } from 'src/knowledges/knowledges.service';
import { MessagesService } from 'src/messages/messages.service';
import { PhonesService } from 'src/phones/phones.service';
import { AssistantType } from 'src/core/enums/assistant.enum';
import { MessageStatus, MessageType } from 'src/core/enums/message.enum';
import { assertion } from 'src/core/utils/common.util';
import { OpenAIService } from 'src/core/openai/services/openai.service';
// import { ToolsService } from 'src/tools/tools.service';
import { AssistantDocument } from 'src/assistants/entities/assistant.entity';
import { ConversationDocument } from 'src/conversations/entities/conversation.entity';
import { PhoneDocument } from 'src/phones/entities/phone.entity';
import { UsageService } from 'src/usage/usage.service';
import { CustomersService } from 'src/customers/customers.service';

@Injectable()
export class WebhooksCommonService {
	constructor(
		public readonly openaiService: OpenAIService,
		public readonly conversationsService: ConversationsService,
		public readonly custoemrsService: CustomersService,
		public readonly assistantsService: AssistantsService,
		public readonly phonesService: PhonesService,
		public readonly messagesService: MessagesService,
		public readonly callsService: CallsService,
		public readonly knowledgesService: KnowledgesService,
		public readonly usageService: UsageService,
	) {}

	async getAssistantAndPhone(
		phoneId: string,
		assistantType: AssistantType,
	) {
		console.log(phoneId);
		const phone = await this.phonesService.getById(phoneId);
		assertion(phone, new NotFoundException('Phone not found'));

		const assistant = await this.assistantsService.getByPhoneId(
			phone._id.toString(),
			phone.organization._id.toString(),
		);
		assertion(assistant, new NotFoundException('Assistant not found'));
		assertion(
			[assistantType, AssistantType.ALL].includes(assistant.type),
			new ForbiddenException('No resource'),
		);

		return { phone, assistant };
	}

	async handleInactiveAssistant(
		conversation: any,
		from: string,
		body: string,
		smsStatus: string,
		messageSid: string,
		params: any,
	) {
		await this.messagesService.create({
			organization: conversation.organization,
			conversation: conversation._id,
			messageSid,
			phoneNumber: from,
			content: body,
			type: MessageType.INBOUND,
			status: MessageStatus[smsStatus.toUpperCase()],
		});

		await this.messagesService.reply(
			from,
			'Sorry, we are offline. Try later.',
			conversation._id,
			conversation.organization,
			params,
		);

		return true;
	}

	async createInboundMessage(
		organizationId: string,
		conversationId: string,
		messageSid: string,
		from: string,
		body: string,
		smsStatus: string,
	) {
		await this.messagesService.create({
			organization: organizationId,
			conversation: conversationId,
			messageSid,
			phoneNumber: from,
			content: body,
			type: MessageType.INBOUND,
			status: MessageStatus[smsStatus.toUpperCase()],
		});
		return true;
	}

	async reply(
		body: string,
		assistant: AssistantDocument,
		conversation: ConversationDocument,
		phone: PhoneDocument,
		history: any[],
		from: string,
		params: any,
	) {
		const customer = await this.loadCustomerKnowledge(from.replace('whatsapp:', ''), phone.organization._id.toString());

		const instructions = `${assistant.instructions}

		# Customer Knowledge
		You are talking with the following customer (see JSON below that describe the information of the customer)
		${customer}`;

		const messages = [
			{ role: 'system', content: instructions },
			...history.map((m) => ({
				role: m.type === 'inbound' ? 'user' : 'assistant',
				content: m.content,
			})),
			{ role: 'user', content: body },
		];

		const query = (
			await this.openaiService.createVector(
				body,
				{},
				phone.organization._id.toString(),
			)
		).data[0].embedding;
		const knowledges = (
			await this.knowledgesService.findWithSimilarities(
				query,
				phone.organization._id,
				assistant.knowledge,
			)
		).map((item) => ({
			content: item.chunks.content,
			similarity: item.similarity,
			vector: [],
		}));

		// include customer data

		// const tools = (await this.toolsService.findWithSimilarities(query, assistant.organization._id, assistant._id, 1)).map(item => ({ name: item.name, description: item.description, endpoint: item.endpoint, endpointApiKey: item.endpointApiKey, similarity: item.similarity }));

		// response
		let finalContent = '';

		// get phone number from the from and check if it is a whatsapp number
		const isWhatsapp = from.includes('whatsapp:');
		const functionContext = {
			phoneNumber: isWhatsapp ? from.split(':').at(-1) : from,
			organizationId: phone.organization._id.toString(),
		};

		for await (const chunk of this.openaiService.streamChatCompletion(
			messages,
			{},
			knowledges,
			null,
			functionContext,
		)) {
			if (chunk.content) {
				finalContent += chunk.content;
			}
		}

		await this.messagesService.reply(
			from,
			finalContent,
			conversation._id.toString(),
			phone.organization._id.toString(),
			params,
		);

		return true;
	}

	async loadCustomerKnowledge(customerPhoneNumber: string, organizationId) {
		let customer = await this.custoemrsService.findCustomerByPhone(customerPhoneNumber, organizationId);
		customer._id = null;
		customer.organization = null;
		return JSON.stringify({}); // Gabriele remember to update it again
	}
}
