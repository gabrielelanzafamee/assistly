import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema()
export class Organization {
	@Prop({})
	name: string;
	@Prop({})
	type: string;
	
	@Prop({})
	address: string;
  @Prop({})
	zipcode: string;
  @Prop({})
	country: string;
  @Prop({})
	countryCode: string;
  @Prop({})
	city: string;
	
	@Prop({ unique: true })
	phoneNumber: string;
	@Prop({ unique: true })
	email: string;
  
	@Prop({})
	isActive: boolean;

	// services keys
	@Prop({ default: null, required: false })
	calendlyUrl: string;
	@Prop({ default: null, required: false })
	openaiApiKey: string;
	@Prop({ default: null, required: false })
	elevenLabsApiKey: string;
	
	@Prop({ type: Date })
	createdAt: Date;
	@Prop({ type: Date })
	updatedAt: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

OrganizationSchema.pre('save', function (next) {
	const now = new Date();

  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});