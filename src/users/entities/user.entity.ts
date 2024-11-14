import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';
import { UserRoles } from 'src/core/enums/user.enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
	organization: OrganizationDocument;

	@Prop()
	firstName: string;
	@Prop()
	lastName: string;

	@Prop({ unique: true })
  email: string;
	@Prop()
  password: string;

	@Prop()
  role: UserRoles;

	@Prop({ default: true })
  isActive: boolean;

	@Prop({ type: Date })
	createdAt: Date;
	@Prop({ type: Date })
	updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
	const now = new Date();

  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});