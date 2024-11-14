export interface SendMessagePayload {
	body: string;
	from: string;
	to: string;
}

export interface IMessage {
	organization: string;
	conversation: string;
	content: string;
	type: string;
	status: string;
}