import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TwilioService } from '../core/services/twilio.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { assertion, tryCatchSafe } from 'src/core/utils/common.util';
import { IncomingPhoneNumberInstance } from 'twilio/lib/rest/api/v2010/account/incomingPhoneNumber';
import { Phone } from './entities/phone.entity';
import { CreatePhoneDto } from './dto/create-phone.dto';
import { ConfigService } from 'src/core/config/config.service';

// structure to build the base URL for the callback of twilio
// {{BaseUrl}}/api/v1/webhook/phone/{_id}/callbackSms
// {{BaseUrl}}/api/v1/webhook/phone/{_id}/callbackCall
// {{BaseUrl}}/api/v1/webhook/phone/{_id}/callbackStatus

// so the steps is build the number

@Injectable()
export class PhonesService {
	config: any;

	constructor(
		@InjectModel(Phone.name) private readonly phoneModel: Model<Phone>,
		private readonly twilioService: TwilioService,
		private readonly configService: ConfigService
	) {
		this.config = this.configService.getSystemConfig();
	}

	async get(id, organizationId: string) {
		return await this.phoneModel.findOne({ _id: id, organization: organizationId });
	}

	async getById(id) {
		return await this.phoneModel.findOne({ _id: id });
	}

	async getByAccountSidAndPhoneNumber(accountSid: string, phoneNumber: string) {
		// return hte phone model + populated
		return await this.phoneModel.findOne({ accountSid, phoneNumber }).populate(['organization']);
	}

	async list(organizationId: string) {
		return await this.phoneModel.find({ organization: organizationId });
	}

	async createPhoneNumber(data: CreatePhoneDto, organizationId: string) {
		const phoneDB = new this.phoneModel({
			friendlyName: data.friendlyName,
			phoneNumber: data.phoneNumber,

			organization: organizationId,

			smsMethod: 'POST',
			statusCallbackMethod: 'POST',
			voiceMethod: 'POST',
			voiceFallbackMethod: 'POST',
			smsFallbackMethod: 'POST',

			isActive: true
		})

		const result = await phoneDB.save();

		// update the urls
		const smsUrl = `${this.config.baseUrl}/api/v1/webhooks/phone/${result._id}/callbackSms`;
		const whatsappUrl = `${this.config.baseUrl}/api/v1/webhooks/phone/${result._id}/callbackWhatsapp`;
		const whatsappStatusUrl = `${this.config.baseUrl}/api/v1/webhooks/phone/${result._id}/callbackWhatsappStatus`;
		const voiceUrl = `${this.config.baseUrl}/api/v1/webhooks/phone/${result._id}/callbackCall`;
		const statusCallback = `${this.config.baseUrl}/api/v1/webhooks/phone/${result._id}/callbackStatus`;
		const voiceFallback = `${this.config.baseUrl}/api/v1/webhooks/phone/${result._id}/fallbackCall`;
		const smsFallback = `${this.config.baseUrl}/api/v1/webhooks/phone/${result._id}/fallbackSms`;

		const phone: IncomingPhoneNumberInstance | any = await tryCatchSafe(() => this.twilioService.createPhoneNumber({
			phoneNumber: data.phoneNumber,
			friendlyNumber: data.friendlyName,
			smsUrl,
			voiceUrl,
			statusCallback,
			voiceFallback,
			smsFallback
		}));

		if ('success' in phone && phone.success === false) {
			// delete number
			await this.phoneModel.deleteOne({ _id: result._id });
			throw new InternalServerErrorException(phone.message)
		}

		await this.phoneModel.updateOne({ _id: result._id }, {
			smsUrl,
			voiceUrl,
			statusCallback,
			voiceFallback,
			smsFallback,
			whatsappMethod: 'POST',
			whatsappStatusMethod: 'POST',
			whatsappStatusUrl,
			whatsappUrl,
			bundleSid: phone.bundleSid,
			addressSid: phone.addressSid,
			accountSid: phone.accountSid,
			sid: phone.sid,
			uri: phone.uri,
		});

		return phoneDB._id;
	}

	async deletePhoneNumber(phoneNumberId: string, organizationId: string) {
		const phone = await this.phoneModel.findOne({ _id: phoneNumberId, organization: organizationId });
		assertion(phone, new NotFoundException('Phone number not found'));

		const twilioResult = await tryCatchSafe(() => this.twilioService.deletePhoneNumber(phone.sid));

		if (typeof twilioResult !== 'boolean' && 'success' in twilioResult && twilioResult.success === false) {
			throw new InternalServerErrorException("Server Error, try again later")
		}

		// delete from db
		await this.phoneModel.deleteOne({ _id: phone._id });

		return true;
	}
}