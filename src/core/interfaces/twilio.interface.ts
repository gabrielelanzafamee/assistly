export interface ITwilioVoiceCallback {
	Called: string;
	ToState: string;
	CallerCountry: string;
	Direction: string;
	Timestamp: string;
	CallbackSource: string;
	CallerState: string;
	ToZip: string;
	SequenceNumber: string;
	CallSid: string;
	To: string;
	CallerZip: string;
	ToCountry: string;
	CalledZip: string;
	ApiVersion: string;
	CalledCity: string;
	CallStatus: string;
	Duration: string;
	From: string;
	Body?: string;
	CallDuration: string;
	AccountSid: string;
	CalledCountry: string;
	CallerCity: string;
	ToCity: string;
	FromCountry: string;
	Caller: string;
	FromCity: string;
	CalledState: string;
	FromZip: string;
	FromState: string;
}

export interface ITwilioSmsCallback {
	ToCountry: string;
	ToState: string;
	SmsMessageSid: string;
	NumMedia: string;
	ToCity: string;
	FromZip: string;
	SmsSid: string;
	FromState: string;
	SmsStatus: string;
	FromCity: string;
	Body: string;
	FromCountry: string;
	To: string;
	ToZip: string;
	NumSegments: string;
	MessageSid: string;
	AccountSid: string;
	From: string;
	ApiVersion: string;
}

export interface ITwilioWhatsappStatusCallback {}

export interface ITwilioSmsStatusCallback {
	From: string;
	To: string;
	AccountSid: string;
}

export interface ITwilioVoiceStatusCallback {
	Called: string;
	ToState: string;
	CallerCountry: string;
	Direction: string;
	Timestamp: string;
	CallbackSource: string;
	CallerState: string;
	ToZip: string;
	SequenceNumber: string;
	CallSid: string;
	To: string;
	CallerZip: string;
	ToCountry: string;
	CalledZip: string;
	ApiVersion: string;
	CalledCity: string;
	CallStatus: string;
	Duration: string;
	From: string;
	CallDuration: string;
	AccountSid: string;
	CalledCountry: string;
	CallerCity: string;
	ToCity: string;
	FromCountry: string;
	Caller: string;
	FromCity: string;
	CalledState: string;
	FromZip: string;
	FromState: string;
}

export interface ITwilioWhatsappCallback {
	SmsMessageSid: string;
	NumMedia: string;
	ProfileName: string;
	MessageType: string;
	SmsSid: string;
	WaId: string;
	SmsStatus: string;
	Body: string;
	To: string;
	NumSegments: string;
	ReferralNumMedia: string;
	MessageSid: string;
	AccountSid: string;
	From: string;
	ApiVersion: string;
}