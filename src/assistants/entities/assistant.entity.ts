import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';
import { PhoneDocument } from 'src/phones/entities/phone.entity';
import { AssistantType } from 'src/core/enums/assistant.enum';

export type AssistantDocument = HydratedDocument<Assistant>;

@Schema()
export class Assistant {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true })
	organization: OrganizationDocument;
  
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Phone', required: true })
	number: PhoneDocument;

	@Prop({ required: true })
	name: string;
	@Prop({ required: true, default: 'chat' })
	type: AssistantType; // chat | call | both
	@Prop({ default: 'offline' })
	status: string; // online | offline | busy | away | do not disturb

	@Prop({ default: true, maxlength: 8000 })
	instructions: string;
	@Prop({ default: [] })
	knowledge: string[]

	@Prop({ default: true })
	isActive: boolean;
	
	@Prop({ type: Date })
	createdAt: Date;
	@Prop({ type: Date })
	updatedAt: Date;
}

export const AssistantSchema = SchemaFactory.createForClass(Assistant);

AssistantSchema.pre('save', function (next) {
	const now = new Date();

  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});