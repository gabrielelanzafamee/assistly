import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AssistantDocument } from 'src/assistants/entities/assistant.entity';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';
import { PhoneDocument } from 'src/phones/entities/phone.entity';
import { CallStatus } from 'src/core/enums/call.enum';

export type CallDocument = HydratedDocument<Call>;

@Schema()
export class Call {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
	organization: OrganizationDocument;
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Assistant' })
	assistant: AssistantDocument;
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Phone' })
	phone: PhoneDocument;

	// twilio data
	@Prop({})
	callSid: string;

	@Prop({})
	from: string;
	@Prop({})
	to: string;

	@Prop({})
	transcript: [
		{
			role: string;
			content: string;
			at: Date;
		}
	]

	@Prop({})
	status: CallStatus;

	@Prop({ type: Date })
	createdAt: Date;
	@Prop({ type: Date })
	updatedAt: Date;
}

export const CallSchema = SchemaFactory.createForClass(Call);

CallSchema.pre('save', function (next) {
	const now = new Date();

  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});
