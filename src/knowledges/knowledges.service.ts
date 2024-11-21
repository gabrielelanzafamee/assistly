import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { extractTextFromFile } from 'src/core/utils/document.util';
import { assertion } from 'src/core/utils/common.util';
import { Knowledge, KnowledgeDocument } from './entities/knowledge.entity';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { OpenAIService } from 'src/core/openai/services/openai.service';
import { plansLimitations } from 'src/core/config/organization.config';

@Injectable()
export class KnowledgesService {
	constructor(
		@InjectModel(Knowledge.name) private knowledgeModel: Model<Knowledge>,
		private readonly organizationsService: OrganizationsService,
		private readonly openaiService: OpenAIService
	) {}

	async create(
		data: CreateKnowledgeDto,
		files: Express.Multer.File[],
		organizationId: string,
	): Promise<KnowledgeDocument> {
		// check if organizationId already exist
		const organization = await this.organizationsService.get(organizationId);
		assertion(organization, new BadRequestException('Organization not found'));

		// get total size file
		const knowledges = await this.list(organizationId);
		const uploadedMb = knowledges.reduce((total, item) => total + item.totalSize, 0);
		const filesMb = files.reduce((total, item) => total + (item.size * 1024 * 1024), 0);
		const totalMb = filesMb + uploadedMb;
		assertion(totalMb < plansLimitations[organization.plan].knowledgeMB, new BadRequestException('Total knowledge size exceeds plan limit'));

		const chunks = (
			await Promise.all(
				files.map(async (file) => {
					return await this.processDocument(file, organizationId);
				}),
			)
		).flat();

		// build knowledge
		const knowledge = new this.knowledgeModel({
			name: data.name,
			organization: organizationId,
			chunks,
		});

		return await knowledge.save();
	}

	async get(id: string, organizationId: string): Promise<KnowledgeDocument> {
		return await this.knowledgeModel.findOne({
			_id: id,
			organization: organizationId,
		});
	}

	async list(organizationId: string): Promise<KnowledgeDocument[]> {
		return await this.knowledgeModel.find({ organization: organizationId });
	}

	async delete(knowledgeId: string, organizaitonId: string): Promise<any> {
		return await this.knowledgeModel.deleteOne({ _id: knowledgeId, organization: organizaitonId });
	}

	async processDocument(file: Express.Multer.File, organizationId: string = null): Promise<any> {
		const chunkSize: number = 1024;
		const chunks: { filename: string; content: string; vector: number[] }[] = [];

		const content = await extractTextFromFile(file);

		for (let i = 0; i < content.length; i += chunkSize) {
			const chunk = content.substring(i, i + chunkSize);
			const vector = await this.openaiService.createVector(chunk, {}, organizationId);
			chunks.push({
				filename: file.filename || file.originalname,
				content: chunk,
				vector: vector.data[0].embedding,
			});
		}

		return chunks;
	}

	async findWithSimilarities(queryVector: number[], organizationId: mongoose.Types.ObjectId, knowledgeIds: string[] = [], limit: number = 5) {
		return await this.knowledgeModel.aggregate([
			{ $match: { 
				organization: organizationId,
				...(knowledgeIds.length > 0 ? { _id: { $in: knowledgeIds.map(id => new mongoose.Types.ObjectId(id)) } } : {})
			 } },
			{ $unwind: '$chunks' },
			{
				$project: {
					name: 1,
					'chunks.content': 1,
					'chunks.vector': 1,
					similarity: {
						$let: {
							vars: {
								vector1: '$chunks.vector',
								vector2: queryVector,
							},
							in: {
								$divide: [
									{
										$sum: {
											$map: {
												input: { $range: [0, { $size: '$$vector1' }] },
												as: 'i',
												in: {
													$multiply: [
														{ $arrayElemAt: ['$$vector1', '$$i'] },
														{ $arrayElemAt: ['$$vector2', '$$i'] },
													],
												},
											},
										},
									},
									{
										$multiply: [
											{
												$sqrt: {
													$sum: {
														$map: {
															input: '$$vector1',
															as: 'v',
															in: { $multiply: ['$$v', '$$v'] },
														},
													},
												},
											},
											{
												$sqrt: {
													$sum: {
														$map: {
															input: '$$vector2',
															as: 'v',
															in: { $multiply: ['$$v', '$$v'] },
														},
													},
												},
											},
										],
									},
								],
							},
						},
					},
				},
			},
			{ $sort: { similarity: -1 } },
			{ $limit: limit },
		]);
	}
}
