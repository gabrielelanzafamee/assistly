import { ApiTags } from "@nestjs/swagger";
import { ApiController } from "src/core/decorators/api.decorator";
import { WebhooksService } from "./webhooks.service";
import { Body, Param, Post, Res } from "@nestjs/common";
import { successResponse } from "src/core/utils/responses.util";
import { ITwilioSmsCallback, ITwilioSmsStatusCallback, ITwilioVoiceCallback, ITwilioVoiceStatusCallback, ITwilioWhatsappCallback, ITwilioWhatsappStatusCallback } from "src/core/interfaces/twilio.interface";

@ApiController('webhooks')
@ApiTags('webhooks')
export class WebhooksController {
  constructor(
		private readonly webhooksService: WebhooksService
	) {}

	@Post('phone/:id/callbackSms')
	async callbackSms(@Body() body: ITwilioSmsCallback, @Param('id') id: string) {
		console.log('callbackSms', body);
		return successResponse(await this.webhooksService.callbackSms(body, id));
	}
	
	@Post('phone/:id/callbackCall')
	async callbackCall(@Res() res, @Body() body: ITwilioVoiceCallback, @Param('id') id: string) {
		console.log('callbackCall', body);
		const response = await this.webhooksService.callbackCall(body, id);
		return res.type('text/xml').send(response);
	}
	
	@Post('phone/:id/callbackWhatsapp')
	async callbackWhatsapp(@Body() body: ITwilioWhatsappCallback, @Param('id') id: string) {
		console.log('callbackWhatsapp', body);
		return successResponse(await this.webhooksService.callbackWhatsapp(body, id));
	}

	@Post('phone/:id/callbackWhatsappStatus')
	async callbackWhatsappStatus(@Body() body: ITwilioWhatsappStatusCallback, @Param('id') id: string) {
		console.log('callbackWhatsappStatus', body);
		return successResponse(await this.webhooksService.callbackWhatsappStatus(body, id));
	}
	

	@Post('phone/:id/callbackStatus')
	async callbackStatus(@Body() body: ITwilioVoiceStatusCallback, @Param('id') id: string) {
		console.log('callbackStatus', body);
		return successResponse(await this.webhooksService.callbackStatus(body, id));
	}
	
	@Post('phone/:id/fallbackCall')
	async fallbackCall(@Res() res, @Body() body: ITwilioVoiceCallback, @Param('id') id: string) {
		console.log('fallbackCall', body);
		const response = await this.webhooksService.fallbackCall(body, id);
		return res.type('text/xml').send(response);
	}
	
	@Post('phone/:id/fallbackSms')
	async fallbackSms(@Body() body: ITwilioSmsCallback, @Param('id') id: string) {
		console.log('fallbackSms', body);
		return successResponse(await this.webhooksService.fallbackSms(body, id));
	}
}
