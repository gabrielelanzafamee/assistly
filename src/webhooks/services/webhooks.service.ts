import { Injectable } from '@nestjs/common';
import { WebhooksSmsService } from './webhooks-sms.service';
import { WebhooksCommonService } from './webhooks-common.service';
import { WebhooksWhatsappService } from './webhooks-whatsapp.service';
import { WebhooksCallsService } from './webhooks-calls.service';

@Injectable()
export class WebhooksService {
	constructor(
		public readonly webhooksSmsService: WebhooksSmsService,
		public readonly webhooksCallsService: WebhooksCallsService,
		public readonly webhooksWhatsappService: WebhooksWhatsappService,
		public readonly webhooksCommonsService: WebhooksCommonService
	) {}
}
