import { MessageType } from "src/core/enums/message.enum";
import { MessageStatus } from "twilio/lib/rest/api/v2010/account/message";

export class CreateMessageDto {
	organization: string;
	conversation: string;
	messageSid: string;
	waId?: string | null;
	phoneNumber: string;
	content: string;
	type: MessageType;
	status: MessageStatus;
}
