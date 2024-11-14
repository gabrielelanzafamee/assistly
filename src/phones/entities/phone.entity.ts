import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';

export type PhoneDocument = HydratedDocument<Phone>;

@Schema()
export class Phone {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
	organization: OrganizationDocument;

	// twilio info
	@Prop({})
	accountSid: string;
	@Prop({})
	addressSid: string;
	@Prop({})
	bundleSid: string;
	@Prop({})
	sid: string;
	@Prop({})
	uri: string;

	// general
	@Prop({})
	friendlyName: string;
	@Prop({})
	phoneNumber: string;
	
	// webhooks urls
	@Prop({})
	smsUrl: string;
	@Prop({})
	smsMethod: string; // GET | POST

	@Prop({})
	voiceUrl: string;
	@Prop({})
	voiceMethod: string; // GET | POST

	@Prop({})
	whatsappUrl: string;
	@Prop({})
	whatsappMethod: string; // GET | POST

	@Prop({})
	whatsappStatusUrl: string;
	@Prop({})
	whatsappStatusMethod: string; // GET | POST

	@Prop({})
	statusCallback: string;
	@Prop({})
	statusCallbackMethod: string; // GET | POST

	@Prop({})
	smsFallback: string;
	@Prop({})
	smsFallbackMethod: string;
	
	@Prop({})
	voiceFallback: string;
	@Prop({})
	voiceFallbackMethod: string;

	@Prop({})
	isActive: boolean;
	
	@Prop({ type: Date })
	createdAt: Date;
	@Prop({ type: Date })
	updatedAt: Date;
}

export const PhoneSchema = SchemaFactory.createForClass(Phone);

PhoneSchema.pre('save', function (next) {
	const now = new Date();

  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});