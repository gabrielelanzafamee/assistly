import { Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { IRequest } from 'src/core/interfaces/request.interface';
import { successResponse } from 'src/core/utils/responses.util';
import { ApiTags } from '@nestjs/swagger';
import { ApiController } from 'src/core/decorators/api.decorator';
import { Authenticated } from 'src/core/decorators/auth.decorator';

@ApiTags('tools')
@ApiController('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post()
	@Authenticated()
  async create(@Req() req: IRequest, @Body() body: CreateToolDto) {
    const result = await this.toolsService.create(body, req.organization._id.toString());
		return successResponse(result);
  }

  @Get()
	@Authenticated()
  async list(@Req() req: IRequest) {
    const result = await this.toolsService.list(req.organization._id.toString());
		return successResponse(result);
  }

  @Get(':id')
	@Authenticated()
  async findOne(@Req() req: IRequest, @Param('id') id: string) {
    const result = await this.toolsService.get(id, req.organization._id.toString());
		return successResponse(result);
  }

  @Patch(':id')
	@Authenticated()
  async update(@Req() req: IRequest, @Param('id') id: string, @Body() body: UpdateToolDto) {
    const result = await this.toolsService.update(id, body, req.organization._id.toString());
		return successResponse(result);
  }

  @Delete(':id')
	@Authenticated()
  async remove(@Req() req: IRequest, @Param('id') id: string) {
    const result = await this.toolsService.remove(id, req.organization._id.toString());
		return successResponse(result);
  }

	@Get('test-page/test-data')
	async test() {
		return successResponse([
			{
				name: "Intro",
				value: "VCCP IS GAY"
			},
			{
				name: "Intro",
				value: "VCCP IS POWER"
			},
			{
				name: "Intro",
				value: "VCCP IS AD"
			}
		])
	}
}