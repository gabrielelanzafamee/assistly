import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assistant, AssistantDocument } from './entities/assistant.entity';
import { PhonesService } from 'src/phones/phones.service';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { assertion } from 'src/core/utils/common.util';
import { UpdateAssistantDto } from './dto/update-assistant.dto';

@Injectable()
export class AssistantsService {
	constructor(
		@InjectModel(Assistant.name) private assistantModel: Model<Assistant>,
		private readonly phonesService: PhonesService,
		private readonly organizationsService: OrganizationsService,
	) {}

	async create(data: CreateAssistantDto, organizationId: string): Promise<AssistantDocument> {
		// check if organizationId already exist
		const organization = await this.organizationsService.get(organizationId);
		assertion(organization, new BadRequestException('Organization not found'));
		
		const phone = await this.phonesService.get(data.numberId, organizationId);
		assertion(phone, new BadRequestException('Number not found'));

		const assistant = new this.assistantModel({
			name: data.name,
			type: data.type,
			instructions: data.instructions,
			knowledge: data.knowledge,
			organization: organizationId,
			number: data.numberId
		});

		return await assistant.save();
	}

	async list(organizationId: string): Promise<AssistantDocument[]> {
		return await this.assistantModel.find({ organization: organizationId });
	}

	async update(id: string, organizationId: string, data: UpdateAssistantDto): Promise<any> {
		return await this.assistantModel.updateOne({ _id: id, organization: organizationId }, {
			...data,
			number: data.numberId,
			organization: organizationId
		});
	}

	async get(id: string, organizationId): Promise<AssistantDocument> {
		const result = await this.assistantModel.findOne({ _id: id, organization: organizationId });
		assertion(result, new BadRequestException('Assistant not found'));
		return result;
	}

	async getByPhoneId(phoneId: string, organizationId: string): Promise<AssistantDocument> {
		return await this.assistantModel.findOne({ organization: organizationId, number: phoneId }).populate(['number'])
	}

	async delete(assisatntId, organizationId) {
		return await this.assistantModel.deleteOne({ _id: assisatntId, organization: organizationId });
	} 
}

