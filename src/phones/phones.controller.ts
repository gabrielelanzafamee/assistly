import { Body, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiController } from 'src/core/decorators/api.decorator';
import { Authenticated } from 'src/core/decorators/auth.decorator';
import { IRequest } from 'src/core/interfaces/request.interface';
import { TwilioService } from 'src/core/services/twilio.service';
import { successResponse } from 'src/core/utils/responses.util';
import { PhonesService } from './phones.service';
import { CreatePhoneDto } from './dto/create-phone.dto';

@ApiTags('phones')
@ApiController('phones')
export class PhonesController {
  constructor(
		private readonly phonesService: PhonesService,
		private readonly twilioService: TwilioService
	) {}

	@Post()
	@Authenticated()
	async createPhoneNumber(@Req() req: IRequest, @Body() data: CreatePhoneDto) {
		const results = await this.phonesService.createPhoneNumber(data, req.organization._id.toString());
		return successResponse(results, 'Phone number created successfully');
	}

  @Get()
	@Authenticated()
  async list(@Req() req: IRequest, @Query('limit') limit: number = 12, @Query('offset') offset: number = 0) {
		const result = await this.phonesService.list(req.organization._id.toString(), { limit, offset });
		const count = await this.phonesService.count(req.organization._id.toString());
		return successResponse(result, 'success', { count });
  }

	@Get(':id')
	@Authenticated()
	async getPhoneNumber(@Req() req: IRequest, @Param('id') id: string) {
		const results = await this.phonesService.get(id, req.organization._id.toString());
		return successResponse(results, 'Phone number retrieved successfully');
	}


	@Get('/twilio/available')
	@Authenticated()
	async getAvailablePhoneNumbers(@Req() req: IRequest, @Query('countryCode') cc: string) {
		const countryCode = cc || req.organization.countryCode;
		const results = await this.twilioService.getAvailablePhoneNumbers(countryCode);
		return successResponse(results, 'Phone numbers retrieved successfully');
	}

	@Delete(':id')
	@Authenticated()
	async deletePhoneNumber(@Req() req: IRequest, @Param() params: any) {
		const result = await this.phonesService.deletePhoneNumber(params.id, req.organization._id.toString());
		return successResponse(result, 'Phone number delete successfully');
	}
}
