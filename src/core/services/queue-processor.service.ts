import { Injectable } from '@nestjs/common';
import { CallStatus } from '../enums/call.enum';
import { plansLimitations } from '../config/organization.config';
import { CallQueueService } from './call-queue.service';
import { CallsService } from 'src/calls/calls.service';
import { TwilioService } from './twilio.service';
import { ConfigService } from '../config/config.service';
import { CallQueueDocument } from '../entities/queue-call.entity';

@Injectable()
export class QueueProcessorService {
  constructor(
    private readonly callQueueService: CallQueueService,
    private readonly callsService: CallsService,
		private readonly twilioService: TwilioService,
		private readonly configService: ConfigService
  ) {}

  async processQueue(organizationId: string) {
    const maxCalls = plansLimitations[organizationId]?.calls ?? 0;

    while (true) {
      const activeCallsCount = await this.callsService.getCallsByStatus(
        organizationId,
        CallStatus.IN_PROGRESS,
      );

      if (activeCallsCount >= maxCalls) break; // Stop processing if active calls reach the limit

      const nextCall = await this.callQueueService.dequeueCall(organizationId);
      if (!nextCall) break; // Stop processing if there are no calls in the queue

      // Process the queued call
      await this.processCall(nextCall);
    }
  }

  private async processCall(call: CallQueueDocument) {
    try {
      console.log('Processing queued call:', call);

			const url = `${this.configService.getSystemConfig().baseUrl}/api/v1/webhooks/phone/${call.phone._id}/callbackCall`;
			await this.twilioService.startCall(call.from, call.to, url);
    } catch (error) {
      console.error('Failed to process call:', call, error);
    }
  }
}
