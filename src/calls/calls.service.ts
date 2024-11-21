import { Injectable } from '@nestjs/common';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Call, CallDocument } from './entities/call.entity';
import { Model } from 'mongoose';
import { CallStatus } from 'src/core/enums/call.enum';

@Injectable()
export class CallsService {
	constructor(
		@InjectModel(Call.name) private callModel: Model<Call>,
	) {}

  async create(createCallDto: CreateCallDto) {
		return await new this.callModel(createCallDto).save();
  }

  async list(organizationId: string, pagination = null) {
		if (pagination !== null) {
			return await this.callModel.find({ organization: organizationId }).skip(pagination.offset).limit(pagination.limit).populate(['organization', 'assistant', 'phone'])
		}
		return await this.callModel.find({ organization: organizationId }).populate(['organization', 'assistant', 'phone'])
  }

	async count(organizationId: string) {
		return await this.callModel.countDocuments({ organization: organizationId });
	}

	async get(id: string, organizationId: string) {
		return (await this.callModel.findOne({ _id: id, organization: organizationId })).populate(['organization', 'assistant', 'phone'])
	}

  async update(id: string, orgnaizationId: string, updateCallDto: UpdateCallDto) {
		return await this.callModel.updateOne({ _id: id, organization: orgnaizationId }, updateCallDto);
  }

  async remove(id: string, organizationId: string) {
		return await this.callModel.deleteOne({ _id: id, organization: organizationId });
  }

	async addTranscript(id: string, organizationId: string, role: string, content: string) {
		const call = await this.get(id, organizationId);
		const transcript = [...call.transcript, { role, content, at: new Date() }];
		return await this.update(id, organizationId, { transcript });
	}

	async getCallTwilio(from: string, phone : string, organization: string): Promise<CallDocument> {
		return await this.callModel
			.findOne({ from, phone, organization })
			.populate(['phone', 'organization', 'assistant']);
	}

	async getCallsByStatus(organization: string, status: CallStatus): Promise<number> {
		return await this.callModel
			.find({ organization, status })
			.countDocuments();
	}
}
