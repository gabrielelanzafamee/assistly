import { IResponseBase } from "./response.interface";

export interface IKnowledgeItemChunk {
	content: string;
	vector: number[];
}

export interface IKnowledgeItem {
  _id: string;
  _v: string;
  organization: string;
  name: string;
  chunks: IKnowledgeItemChunk[];
  createdAt: string;
  updatedAt: string;
}

export interface IKnowledgeCreateRequest {
  name: string;
  files: File[];
}

export interface IKnowledgeListResponse extends IResponseBase {
  results: IKnowledgeItem[];
}

export interface IKnowledgeCreateResponse extends IResponseBase {
  results: IKnowledgeItem;
}

export interface IKnowledgeDeleteResponse extends IResponseBase {
  results: string;
}
