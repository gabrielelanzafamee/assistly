import { IResponseBase } from "./response.interface";

export interface IMessageItem {
  _id: string;
  _v: string;
  organization: string;
  conversation: string;
  messageSid: string;
  waId: string;
  phoneNumber: string;
	content: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMessageCreateRequest {
	organization: string;
	conversation: string;
	messageSid: string;
	waId?: string | null;
	phoneNumber: string;
	content: string;
	type: string;
	status: string;
}

export interface IMessageSendRequest {
	content: string;
}

export interface IMessageSingleResponse extends IResponseBase {
  results: IMessageItem;
}

export interface IMessageSendResponse extends IResponseBase {
  results: IMessageItem;
}

export interface IMessageListResponse extends IResponseBase {
  results: IMessageItem[];
}

export interface IMessageCreateResponse extends IResponseBase {
  results: IMessageItem;
}

export interface IMessageDeleteResponse extends IResponseBase {
  results: string;
}
