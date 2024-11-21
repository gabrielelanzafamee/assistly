import { IResponseBase } from "./response.interface";

export interface IConversationItem {
  _id: string;
  _v: string;
  organization: any;
  assistant: any;
  phone: any;
  from: string;
  status: string;
  type: string;
  automaticReply: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IConversationCreateRequest {
	assistant: string;
	phone: string;
	from: string;
	status: string;
	type: string;
}

export interface IConversationUpdateRequest {
	assistant?: string;
	phone?: string;
	from?: string;
	status?: string;
  automaticReply?: boolean;
	type?: string;
}

export interface IConversationListResponse extends IResponseBase {
  results: IConversationItem[];
  count: number;
}

export interface IConversationSingleResponse extends IResponseBase {
  results: IConversationItem;
}

export interface IConversationCreateResponse extends IResponseBase {
  results: IConversationItem;
}

export interface IConversationUpdateResponse extends IResponseBase {
  results: IConversationItem;
}

export interface IConversationDeleteResponse extends IResponseBase {
  results: string;
}
