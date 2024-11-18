import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';

export type UsageRecordDocument = HydratedDocument<UsageRecord>;

@Schema()
export class UsageRecord {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
	organization: OrganizationDocument;

	@Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  service: string;  // 'openai', 'elevenlabs', 'deepgram', 'twilio'

  @Prop({ required: true })
  type: string;     // 'input_tokens', 'output_tokens', 'characters', 'minutes', 'sms', 'whatsapp'

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: false })
  metadata?: any;

  @Prop({ required: true })
  cost: number;     // Pre-calculated cost based on pricing
}

export const UsageRecordSchema = SchemaFactory.createForClass(UsageRecord);