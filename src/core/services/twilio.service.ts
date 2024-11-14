import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';

import { SendMessagePayload } from 'src/core/interfaces/messages.interface';
import { ConfigService } from '../config/config.service';

interface ICreatePhoneNumberTwilio {
	phoneNumber: string;
	friendlyNumber: string;
	smsUrl: string;
	voiceUrl: string;
	statusCallback: string;
	voiceFallback: string;
	smsFallback: string;
}

@Injectable()
export class TwilioService {
	client: Twilio;
	config: any;

	constructor(
		private configService: ConfigService
	) {
		this.config = this.configService.getSystemConfig();
		this.client = new Twilio(
			this.config.twilio.TWILIO_ACCOUNT_SID,
			this.config.twilio.TWILIO_AUTH_TOKEN
		);
	}

	async createPhoneNumber(data: ICreatePhoneNumberTwilio) {
		return await this.client.incomingPhoneNumbers.create({
			...data,
			statusCallbackMethod: 'POST',
			voiceMethod: 'POST',
			smsMethod: 'POST',
			smsFallbackMethod: 'POST',
			voiceFallbackMethod: 'POST',
			bundleSid: this.config.twilio.TWILIO_BUNDLE_SID,
			addressSid: this.config.twilio.TWILIO_ADDRESS_SID
		})
	}

	async getAvailablePhoneNumbers(countryCode: string) {
		return await this.client.availablePhoneNumbers(countryCode).mobile.list({
			limit: 50,
			smsEnabled: true,
			voiceEnabled: true
		})
	}

	async deletePhoneNumber(sid: string) {
		return await this.client.incomingPhoneNumbers(sid).remove();
	}

	async sendMessage(payload: SendMessagePayload) {
		return await this.client.messages.create(payload);
	}

	isE164(number: string) {
		const regex = new RegExp(/^\+[1-9]\d{1,14}$/);
		return regex.test(number);
	}
}