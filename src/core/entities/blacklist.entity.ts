import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';

export type BlacklistDocument = HydratedDocument<Blacklist>;

@Schema()
export class Blacklist {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
	organization: OrganizationDocument;

	@Prop()
	phoneNumber: string;
	@Prop()
	reason: string;
	@Prop({ type: Date })
	blockedAt: Date;
	@Prop()
	count: number;
	@Prop({ type: Date })
  windowStart?: Date;
	
	@Prop({ type: Date })
	createdAt: Date;
	@Prop({ type: Date })
	updatedAt: Date;
}

export const BlacklistSchema = SchemaFactory.createForClass(Blacklist);

BlacklistSchema.pre('save', function (next) {
	const now = new Date();

  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});