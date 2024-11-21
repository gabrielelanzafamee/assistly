import { IResponseBase } from "./response.interface";

export interface IPhoneItem {
  accountSid: string;
  addressSid: string;
  bundleSid: string;
  createdAt: string;
  friendlyName: string;
  isActive: string;
  organization: string;
  phoneNumber: string;
  sid: string;
  smsFallback: string;
  smsFallbackMethod: string;
  smsUrl: string;
  smsMethod: string;
  whatsappUrl: string;
  whatsappMethod: string;
  whatsappStatusUrl: string;
  whatsappStatusMethod: string;
  statusCallback: string;
  statusCallbackMethod: string;
  updatedAt: string;
  uri: string;
  voiceFallback: string;
  voiceFallbackMethod: string;
  voiceMethod: string;
  voiceUrl: string;
  __v: string;
  _id: string;
}

export interface IPhoneItemTwilio {
  friendlyName: string;
  phoneNumber: string;
  lata?: string | null;
  locality?: string | null;
  rateCenter?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  region?: string | null;
  postalCode?: string | null;
  isoCountry?: string | null;
  addressRequirements?: string | null;
  beta?: string | null;
  capabilities?: object | null;
}

export interface IPhonesListResponse extends IResponseBase {
  results: IPhoneItem[]
  count: number;
}

export interface IPhonesListTwilioResponse extends IResponseBase {
  results: IPhoneItemTwilio[]
}

export interface ICreatePhoneRequest {
  friendlyName: string;
  phoneNumber: string;
}

export interface ICreatePhoneResponse extends IResponseBase {
  results: string;
}

export interface IDeletePhoneResposne extends IResponseBase {
  results: string;
}
