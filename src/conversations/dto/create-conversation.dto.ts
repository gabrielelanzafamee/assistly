import { ConversationStatus, ConversationType } from "src/core/enums/conversation.enum";

export class CreateConversationDto {
	organization: string;
	assistant: string;
	phone: string;
	from: string;
	status?: ConversationStatus;
	type?: ConversationType;
}
