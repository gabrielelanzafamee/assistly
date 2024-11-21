import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CallQueue, CallQueueDocument } from '../entities/queue-call.entity';
import { CallStatus } from '../enums/call.enum';

@Injectable()
export class CallQueueService {
  constructor(
    @InjectModel(CallQueue.name)
    private readonly callQueueModel: Model<CallQueueDocument>,
  ) {}

  async enqueueCall(organizationId: string, callDetails: { phoneId: string, callSid: string; from: string; to: string }): Promise<CallQueue> {
    const call = new this.callQueueModel({
      organization: organizationId,
			phone: callDetails.phoneId,
      callSid: callDetails.callSid,
      from: callDetails.from,
      to: callDetails.to,
      status: CallStatus.QUEUED,
    });
    return await call.save();
  }

  async dequeueCall(organizationId: string): Promise<CallQueueDocument | null> {
    return await this.callQueueModel
      .findOneAndDelete({ organization: organizationId, status: CallStatus.QUEUED })
			.populate(['organization', 'phone'])
      .sort({ createdAt: 1 });
  }

  async peekQueue(organizationId: string): Promise<CallQueueDocument | null> {
    return await this.callQueueModel
      .findOne({ organization: organizationId, status: CallStatus.QUEUED })
			.populate(['organization', 'phone'])
      .sort({ createdAt: 1 });
  }

  async getQueueLength(organizationId: string): Promise<number> {
    return await this.callQueueModel.countDocuments({ organization: organizationId, status: CallStatus.QUEUED });
  }

  // ** New method to fetch organizations with active queues **
  async getOrganizationsWithQueues(): Promise<string[]> {
    const organizations = await this.callQueueModel.distinct('organization', { status: CallStatus.QUEUED });
    return organizations.map((orgId) => orgId.toString());
  }

  async clearQueue(organizationId: string): Promise<void> {
    await this.callQueueModel.deleteMany({ organization: organizationId });
  }
}
