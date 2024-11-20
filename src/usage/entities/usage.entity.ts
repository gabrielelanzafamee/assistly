import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';

export type UsageDocument = HydratedDocument<Usage>;

@Schema()
export class Usage {
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

  @Prop({ type: Object })
  metadata?: any;

  @Prop({ required: true })
  cost: number;     // Pre-calculated cost based on pricing
}

export const UsageSchema = SchemaFactory.createForClass(Usage);