import { IResponseBase } from "./response.interface";

export interface IAuthLogin {
  email?: string | null;
  password?: string | null;
}

export interface IAuthSignup {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    password?: string | null;
  },
  organization: {
    name?: string | null;
    type?: string | null;
    address?: string | null;
    zipcode?: string | null;
    country?: string | null;
    countryCode?: string | null;
    city?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
  }
}

export interface IAuthLoginResponse extends IResponseBase {
  results: {
    access_token: string;
  };
}
