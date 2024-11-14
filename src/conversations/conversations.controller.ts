import { ConversationsService } from './conversations.service';
import { ApiController } from 'src/core/decorators/api.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Body, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Authenticated } from 'src/core/decorators/auth.decorator';
import { IRequest } from 'src/core/interfaces/request.interface';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { successResponse } from 'src/core/utils/responses.util';

@ApiController('conversations')
@ApiTags('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

	@Get()
	@Authenticated()
	async list(@Req() req: IRequest) {
		const result = await this.conversationsService.list(req.organization._id.toString());
		return successResponse(result, 'success');
	}
	
	@Post()
	@Authenticated()
	async create(@Req() req: IRequest, @Body() body: CreateConversationDto) {
		const result = await this.conversationsService.create({ ...body, organization: req.organization._id.toString() });
		return successResponse(result, 'success');
	}

	@Patch(':id')
	@Authenticated()
	async update(@Req() req: IRequest, @Param('id') id: string,  @Body() body: UpdateConversationDto) {
		const result = await this.conversationsService.update(id, req.organization._id.toString(), { ...body, organization: req.organization._id.toString() });
		return successResponse(result, 'success');
	}

	@Get(':id')
	@Authenticated()
	async single(@Req() req: IRequest, @Param('id') id: string) {
		const result = await this.conversationsService.get(id, req.organization._id.toString());
		return successResponse(result, 'success');
	}

	@Delete(':id')
	@Authenticated()
	async delete(@Req() req: IRequest, @Param('id') id: string) {
		const result = await this.conversationsService.delete(id, req.organization._id.toString());
		return successResponse(result, 'success');
	}
}
