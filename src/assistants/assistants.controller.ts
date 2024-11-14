import { Body, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiController } from 'src/core/decorators/api.decorator';
import { IRequest } from 'src/core/interfaces/request.interface';
import { successResponse } from 'src/core/utils/responses.util';
import { Authenticated } from 'src/core/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';
import { AssistantsService } from './assistants.service';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';

@ApiController('assistants')
@ApiTags('assistants')
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) {}

	@Post('')
	@Authenticated()
	async create(@Req() req: IRequest, @Body() body: CreateAssistantDto) {
		const result = await this.assistantsService.create(body, req.organization._id.toString());
		return successResponse(result);
	}

	@Get('')
	@Authenticated()
	async list(@Req() req: IRequest) {
		const result = await this.assistantsService.list(req.organization._id.toString());
		return successResponse(result);
	}

	@Get(':id')
	@Authenticated()
	async single(@Req() req: IRequest, @Param('id') id: string) {
		const result = await this.assistantsService.get(id, req.organization._id.toString());
		return successResponse(result);
	}

	@Patch(':id')
	@Authenticated()
	async update(@Req() req: IRequest, @Param('id') id: string, @Body() body: UpdateAssistantDto) {
		const result = await this.assistantsService.update(id, req.organization._id.toString(), body);
		return successResponse(result);
	}

	@Delete(':id')
	@Authenticated()
	async delete(@Req() req: IRequest, @Param('id') id: string) {
		const result = await this.assistantsService.delete(id, req.organization._id.toString());
		return successResponse(result);
	}
}
