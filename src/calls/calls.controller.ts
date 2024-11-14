import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { ApiController } from 'src/core/decorators/api.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Authenticated } from 'src/core/decorators/auth.decorator';
import { IRequest } from 'src/core/interfaces/request.interface';
import { successResponse } from 'src/core/utils/responses.util';

@ApiController('calls')
@ApiTags('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post()
	@Authenticated()
  async create(@Req() req: IRequest, @Body() createCallDto: CreateCallDto) {
    const result = await this.callsService.create({ ...createCallDto, organization: req.organization._id.toString() });
		return successResponse(result, 'success');
  }

  @Get()
	@Authenticated()
  async single(@Req() req: IRequest) {
    const result = await this.callsService.list(req.organization._id.toString());
		return successResponse(result, 'success');
  }

  @Get(':id')
	@Authenticated()
  async list(@Req() req: IRequest, @Param('id') id: string) {
    const result = await this.callsService.get(id, req.organization._id.toString());
		return successResponse(result, 'success');
  }

  @Patch(':id')
	@Authenticated()
  async update(@Req() req: IRequest, @Param('id') id: string, @Body() updateCallDto: UpdateCallDto) {
    const result = await this.callsService.update(id, req.organization._id.toString(), updateCallDto);
		return successResponse(result, 'success');
  }

  @Delete(':id')
	@Authenticated()
  async remove(@Req() req: IRequest, @Param('id') id: string) {
    const result = await this.callsService.remove(id, req.organization._id.toString());
		return successResponse(result, 'success');
  }
}
