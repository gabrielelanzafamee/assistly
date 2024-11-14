import { ApiController } from 'src/core/decorators/api.decorator';
import { MessagesService } from './messages.service';
import { ApiTags } from '@nestjs/swagger';
import { Body, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { Authenticated } from 'src/core/decorators/auth.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { IRequest } from 'src/core/interfaces/request.interface';
import { successResponse } from 'src/core/utils/responses.util';

@ApiController('messages')
@ApiTags('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

	@Get()
	@Authenticated()
	async list(@Req() req: IRequest) {
		const result = await this.messagesService.list(req.organization._id.toString());
		return successResponse(result, 'Success');
	}

	@Get('conversation/:id')
	@Authenticated()
	async conversationList(@Req() req: IRequest, @Param('id') id: string) {
		const result = await this.messagesService.listByConversation(id, req.organization._id.toString());
		return successResponse(result, 'Success');
	}
	
	@Post()
	@Authenticated()
	async create(@Req() req: IRequest, @Body() body: CreateMessageDto) {
		const result = await this.messagesService.create({ ...body, organization: req.organization._id.toString() });
		return successResponse(result, 'Success');
	}

	@Get(':id')
	@Authenticated()
	async single(@Req() req: IRequest, @Param('id') id: string) {
		const result = await this.messagesService.get(id, req.organization._id.toString());
		return successResponse(result, 'Success');
	}

	@Post(':id/send')
	@Authenticated()
	async send(@Req() req: IRequest, @Param('id') id: string, @Body() body) {
		const result = await this.messagesService.send(id, req.organization._id.toString(), body);
		return successResponse(result, 'Success');
	}

	@Delete(':id')
	@Authenticated()
	async delete(@Req() req: IRequest, @Param('id') id: string) {
		const result = await this.messagesService.delete(id, req.organization._id.toString());
		return successResponse(result, 'Success');
	}
}
