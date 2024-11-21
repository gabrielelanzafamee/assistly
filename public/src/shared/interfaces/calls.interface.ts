import { IAssistantItem } from "./assistants.interface";
import { IPhoneItem } from "./phones.interface";
import { IResponseBase } from "./response.interface";

export interface ICallItem {
  _id: string;
  _v: string;
	organization: any;
	assistant: IAssistantItem;
	phone: IPhoneItem;
	callSid: string;
	from: string;
	to: string;
	transcript: [
		{
			role: string;
			content: string;
			at: Date;
		}
	]
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ICallCreateRequest {
	organization: string;
	assistant: string;
	phone: string;
	callSid: string;
	from: string;
	to: string;
	transcript: { role: string, content: string, at: Date }[];
	status: string;
}

export interface ICallUpdateRequest {
	organization: string;
	assistant: string;
	phone: string;
	callSid: string;
	from: string;
	to: string;
	transcript: { role: string, content: string, at: Date }[];
	status: string;
}

export interface ICallListResponse extends IResponseBase {
  results: ICallItem[];
  count: number;
}

export interface ICallSingleResponse extends IResponseBase {
  results: ICallItem;
}

export interface ICallCreateResponse extends IResponseBase {
  results: ICallItem;
}

export interface ICallUpdateResponse extends IResponseBase {
  results: ICallItem;
}

export interface ICallDeleteResponse extends IResponseBase {
  results: string;
}
