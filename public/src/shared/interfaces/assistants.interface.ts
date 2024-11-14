import { IResponseBase } from "./response.interface";

export interface IAssistantItem {
  _id: string;
  organization: string;
  number: string;
  name: string;
  type: string;
  status: string;
  instructions: string;
  knowledge: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: string;
}

export interface IAssistantListResponse extends IResponseBase {
  results: IAssistantItem[]
}

export interface ICreateAssistantRequest {
  numberId: string;
  name: string;
  type: string;
  instructions: string;
  knowledge: object[];
}

export interface IUpdateAssistantRequest {
  numberId: string;
  name: string;
  type: string;
  instructions: string;
  isActive: boolean;
  knowledge: object[];
}

export interface ICreateAssistantResponse extends IResponseBase {
  results: string;
}

export interface IUpdateAssistantResponse extends IResponseBase {
  results: string;
}

export interface IDeleteAssistantResponse extends IResponseBase {
  results: string;
}
