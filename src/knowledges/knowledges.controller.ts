import { BadRequestException, Body, Delete, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ApiController } from 'src/core/decorators/api.decorator';
import { Authenticated } from 'src/core/decorators/auth.decorator';
import { IRequest } from 'src/core/interfaces/request.interface';
import { successResponse } from 'src/core/utils/responses.util';
import { assertion } from 'src/core/utils/common.util';
import { KnowledgesService } from './knowledges.service';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';

const validationFile = new ParseFilePipe({
	validators: [
		new MaxFileSizeValidator({ maxSize: 1024 * 1000 * 1 }), // 1MB
		// new FileTypeValidator({ fileType: '' }), // todo add
	]
});

@ApiController('knowledges')
@ApiTags('knowledges')
export class KnowledgesController {
  constructor(
		private readonly knowledgesService: KnowledgesService
	) {}

	@Post()
	@Authenticated()
	@UseInterceptors(FilesInterceptor('files'))
	async buildKnowledge(@Req() req: IRequest, @Body() body: CreateKnowledgeDto, @UploadedFiles(validationFile) files: Express.Multer.File[]) {
		assertion(files.length > 0, new BadRequestException('At least one file is required')); // at least one file
		assertion(files.length <= 5, new BadRequestException('No more than 5 files allowed')); // no more than 5 files
		const result = await this.knowledgesService.create(body, files, req.organization._id.toString());
		return successResponse(result, "Knowledge built successfully");
	}

	@Get()
	@Authenticated()
	async list(@Req() req: IRequest) {
		const response = await this.knowledgesService.list(req.organization._id.toString());
		return successResponse(response, 'Knowledges list fetched successfully.')
	}

	@Get(':id')
	@Authenticated()
	async get(@Req() req: IRequest, @Param('id') id: string) {
		const response = await this.knowledgesService.get(id, req.organization._id.toString());
		return successResponse(response, 'Knowledge retrieved successfully.')
	}

	@Delete(':id')
	@Authenticated()
	async delete(@Req() req: IRequest, @Param('id') id: string) {
		const response = await this.knowledgesService.delete(id, req.organization._id.toString());
		return successResponse(response, 'Knowledge deleted successfully.')
	}
}