import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { assertion } from 'src/core/utils/common.util';

@Injectable()
export class OrganizationsService {
	constructor(
		@InjectModel(Organization.name) public organizationModel: Model<Organization>
	) {}

	async list(): Promise<Organization[]> {
		return await this.organizationModel.find();
	}

	async get(id: string): Promise<Organization> {
		return await this.organizationModel.findOne({ _id: id });
	}

	async create(organization: CreateOrganizationDto): Promise<OrganizationDocument> {
		console.log(organization)
		// check if organization already exist
		const org = await this.organizationModel.findOne({
			$or: [
				{ phoneNumber: organization.phoneNumber },
				{ email: organization.email }
			]
		});

		assertion(!org, new BadRequestException('Organization already exist'))		
		
		return await new this.organizationModel(organization).save();
	}

	async delete(id: string): Promise<Organization> {
		return await this.organizationModel.findOneAndDelete({ _id: id });
	}
}
