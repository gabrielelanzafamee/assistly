import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';
import { CallStatus } from '../enums/call.enum';
import { PhoneDocument } from 'src/phones/entities/phone.entity';

export type CallQueueDocument = HydratedDocument<CallQueue>;

@Schema()
export class CallQueue {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
  organization: OrganizationDocument;

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Phone' })
  phone: PhoneDocument;

  @Prop({ required: true })
  callSid: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ type: String, enum: CallStatus, default: CallStatus.QUEUED }) // Default to QUEUED
  status: CallStatus;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CallQueueSchema = SchemaFactory.createForClass(CallQueue);

CallQueueSchema.pre('save', function (next) {
  const now = new Date();

  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});
