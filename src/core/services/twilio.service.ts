import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';

import { SendMessagePayload } from 'src/core/interfaces/messages.interface';
import { ConfigService } from '../config/config.service';
import { UsageService } from 'src/usage/usage.service';

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
		private configService: ConfigService,
		private usageService: UsageService
	) {
		this.config = this.configService.getSystemConfig();
		this.client = new Twilio(
			this.config.twilio.TWILIO_ACCOUNT_SID,
			this.config.twilio.TWILIO_AUTH_TOKEN
		);
	}

	async createPhoneNumber(data: ICreatePhoneNumberTwilio, organizationId: string) {
		try {
			const number = await this.client.incomingPhoneNumbers.create({
				...data,
				statusCallbackMethod: 'POST',
				voiceMethod: 'POST',
				smsMethod: 'POST',
				smsFallbackMethod: 'POST',
				voiceFallbackMethod: 'POST',
				bundleSid: this.config.twilio.TWILIO_BUNDLE_SID,
				addressSid: this.config.twilio.TWILIO_ADDRESS_SID
			});

			if (organizationId) {
				// Record first month's recurring charge
				await this.usageService.recordUsage(
					organizationId,
					'twilio',
					'phone_number',
					1,
					{
						phoneNumberSid: number.sid,
						phoneNumber: number.phoneNumber,
						startDate: new Date().toISOString()
					}
				);
			}

			return number;
		} catch (error) {
			console.error('Error creating phone number:', error);
			throw error;
		}
	}

	async getAvailablePhoneNumbers(countryCode: string) {
		try {
			return await this.client.availablePhoneNumbers(countryCode).mobile.list({
				limit: 50,
				smsEnabled: true,
				voiceEnabled: true
			});
		} catch (error) {
			console.error('Error fetching available numbers:', error);
			throw error;
		}
	}

	async deletePhoneNumber(sid: string, organizationId: string) {
		try {
			const result = await this.client.incomingPhoneNumbers(sid).remove();

			if (organizationId) {
				// Record phone number deletion to stop monthly charges
				await this.usageService.recordUsage(
					organizationId,
					'twilio',
					'phone_number',
					1,
					{
						phoneNumberSid: sid,
						deletionDate: new Date().toISOString()
					}
				);
			}

			return result;
		} catch (error) {
			console.error('Error deleting phone number:', error);
			throw error;
		}
	}

	async sendMessage(payload: SendMessagePayload, organizationId: string) {
		try {
			const message = await this.client.messages.create(payload);

			if (organizationId) {
				// Track SMS segments
				const segments = Math.ceil((payload.body || '').length / 160);
				await this.usageService.recordUsage(
					organizationId,
					'twilio',
					payload.from.includes('whatsapp:') ? 'whatsapp' : 'sms',
					segments,
					{
						type: 'outbound',
						messageSid: message.sid
					}
				);

				// Track MMS if media is included
				// if (payload.mediaUrl) {
				// 	await this.usageService.recordUsage(
				// 		organizationId,
				// 		'twilio',
				// 		'mms_messages',
				// 		1
				// 	);
				// }
			}

			return message;
		} catch (error) {
			console.error('Error sending message:', error);
			throw error;
		}
	}

	isE164(number: string) {
		const regex = new RegExp(/^\+[1-9]\d{1,14}$/);
		return regex.test(number);
	}
}