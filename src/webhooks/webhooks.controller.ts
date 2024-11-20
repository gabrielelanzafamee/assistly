import { ApiTags } from "@nestjs/swagger";
import { ApiController } from "src/core/decorators/api.decorator";
import { WebhooksService } from "./services/webhooks.service";
import { Body, Param, Post, Res } from "@nestjs/common";
import { successResponse } from "src/core/utils/responses.util";
import { ITwilioSmsCallback, ITwilioSmsStatusCallback, ITwilioVoiceCallback, ITwilioVoiceStatusCallback, ITwilioWhatsappCallback, ITwilioWhatsappStatusCallback } from "src/core/interfaces/twilio.interface";

/**
 * @author: Gabriele Lanzafame
 * @version: 1.0.0
 * 
 * Controller webhook
 */
@ApiController('webhooks')
@ApiTags('webhooks')
export class WebhooksController {
  constructor(
		private readonly webhooksService: WebhooksService
	) {}

	@Post('phone/:id/callbackSms')
	async callbackSms(@Body() body: ITwilioSmsCallback, @Param('id') id: string) {
		console.log('callbackSms', body);
		return successResponse(await this.webhooksService.webhooksSmsService.callbackSms(body, id));
	}
	
	@Post('phone/:id/callbackCall')
	async callbackCall(@Res() res, @Body() body: ITwilioVoiceCallback, @Param('id') id: string) {
		console.log('callbackCall', body);
		const response = await this.webhooksService.webhooksCallsService.callbackCall(body, id);
		return res.type('text/xml').send(response);
	}
	
	@Post('phone/:id/callbackWhatsapp')
	async callbackWhatsapp(@Body() body: ITwilioWhatsappCallback, @Param('id') id: string) {
		console.log('callbackWhatsapp', body);
		return successResponse(await this.webhooksService.webhooksWhatsappService.callbackWhatsapp(body, id));
	}

	@Post('phone/:id/callbackWhatsappStatus')
	async callbackWhatsappStatus(@Body() body: ITwilioWhatsappStatusCallback, @Param('id') id: string) {
		console.log('callbackWhatsappStatus', body);
		return successResponse(await this.webhooksService.webhooksWhatsappService.callbackWhatsappStatus(body, id));
	}
	

	@Post('phone/:id/callbackStatus')
	async callbackStatus(@Body() body: ITwilioVoiceStatusCallback, @Param('id') id: string) {
		console.log('callbackStatus', body);
		return successResponse(await this.webhooksService.webhooksCallsService.callbackStatus(body, id));
	}
	
	@Post('phone/:id/fallbackCall')
	async fallbackCall(@Res() res, @Body() body: ITwilioVoiceCallback, @Param('id') id: string) {
		console.log('fallbackCall', body);
		const response = await this.webhooksService.webhooksCallsService.fallbackCall(body, id);
		return res.type('text/xml').send(response);
	}
	
	@Post('phone/:id/fallbackSms')
	async fallbackSms(@Body() body: ITwilioSmsCallback, @Param('id') id: string) {
		console.log('fallbackSms', body);
		return successResponse(await this.webhooksService.webhooksSmsService.fallbackSms(body, id));
	}
}
