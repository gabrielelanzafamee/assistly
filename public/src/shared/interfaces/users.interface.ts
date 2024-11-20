import { IResponseBase } from "./response.interface";

export enum UserRoles {
	ADMIN = 'admin',
	CUSTOMER = 'customer',
	MANTAINER = 'mantainer',
	DEV = 'dev'
}

export interface IUserItem {
  _id: string;
	organization: string;
	firstName: string;
	lastName: string;
  email: string;
  password: string;
  role: UserRoles;
  isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
  __v: string;
}

export interface IUserListResponse extends IResponseBase {
  results: IUserItem[]
}

export interface ICreateUserRequest {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role?: UserRoles;
}

export interface IUpdateUserRequest {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role?: UserRoles;
  isActive?: boolean;
}

export interface ICreateUserResponse extends IResponseBase {
  results: string;
}

export interface IUpdateUserResponse extends IResponseBase {
  results: string;
}

export interface IDeleteUserResponse extends IResponseBase {
  results: string;
}
