import { CallStatus } from "twilio/lib/rest/api/v2010/account/call";

export class CreateCallDto {
	organization: string;
	assistant: string;
	phone: string;
	callSid: string;
	from: string;
	to: string;
	transcript: { role: string, content: string, at: Date }[];
	status: CallStatus;
}
