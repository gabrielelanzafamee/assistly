import * as twilio from 'twilio';
import {
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { AssistantType } from 'src/core/enums/assistant.enum';
import { CallStatus } from 'src/core/enums/call.enum';
import {
	ITwilioVoiceCallback,
	ITwilioVoiceStatusCallback,
} from 'src/core/interfaces/twilio.interface';
import { assertion } from 'src/core/utils/common.util';
import { WebhooksCommonService } from './webhooks-common.service';

@Injectable()
export class WebhooksCallsService {
	constructor(
		private readonly webhooksCommonService: WebhooksCommonService
	) {}

	async callbackCall(params: ITwilioVoiceCallback, phoneId: string) {
		const response = new twilio.twiml.VoiceResponse();
		const { phone, assistant } = await this.webhooksCommonService.getAssistantAndPhone(
			phoneId,
			AssistantType.CALL,
		);

		// check how many calls and rmeove them
		const calls = await this.webhooksCommonService.callsService.getCallsByStatus(
			params.From,
			phone.organization._id.toString(),
			CallStatus.IN_PROGRESS,
		);
		assertion(calls < 5, new ForbiddenException('Calls full at the moment.'));

		if (calls >= 5) {
			response.say('The line is busy at the moment, try later.');
			return response.toString();
		}

		const call = await this.webhooksCommonService.callsService.create({
			organization: phone.organization._id.toString(),
			assistant: assistant._id.toString(),
			phone: phone._id.toString(),
			callSid: params.CallSid,
			from: params.From,
			to: params.To,
			transcript: [],
			status: CallStatus.QUEUED,
		});
		assertion(call, new InternalServerErrorException('Unable to start a call'));

		if (!assistant.isActive) {
			response.say("I'm sorry but at the moment we are offline. Try Later.");
			return response.toString();
		}

		const connect = response.connect();
		const stream = connect.stream({
			url: `${process.env.BASE_URL.replace('https', 'wss')}/ws/v1/custom`,
		});

		stream.parameter({ name: 'callId', value: call._id.toString() });
		stream.parameter({ name: 'callSid', value: params.CallSid });
		stream.parameter({ name: 'from', value: params.From });
		stream.parameter({ name: 'phoneId', value: phone._id.toString() });
		stream.parameter({ name: 'phoneNumber', value: params.To });
		stream.parameter({
			name: 'organizationId',
			value: phone.organization._id.toString(),
		});

		return response.toString();
	}

	async fallbackCall(params: ITwilioVoiceCallback, phoneId: string) {
		const response = new twilio.twiml.VoiceResponse();
		response.say('Sorry, I am not available right now.');
		return response.toString();
	}

	async callbackStatus(params: ITwilioVoiceStatusCallback, phoneId: string) {
		const { CallbackSource, AccountSid, From, CallDuration } = params;

		const { phone } = await this.webhooksCommonService.getAssistantAndPhone(
			phoneId,
			AssistantType.SMS,
		);
		const call = await this.webhooksCommonService.callsService.getCallTwilio(
			From,
			phone._id.toString(),
			phone.organization._id.toString(),
		);

		// update status
		await this.webhooksCommonService.callsService.update(
			call._id.toString(),
			call.organization._id.toString(),
			{
				status: CallStatus[params.CallStatus.toUpperCase().replace('-', '_')],
			},
		);

		// Record call duration usage when call completes
		if (params.CallStatus === 'completed' && CallDuration) {
			const duration = parseInt(CallDuration);
			await this.webhooksCommonService.usageService.recordUsage(
				call.organization._id.toString(),
				'twilio',
				params.Direction === 'inbound' ? 'inbound_minutes' : 'outbound_minutes',
				duration / 60, // Convert seconds to minutes
			);
		}

		return true;
	}
}
