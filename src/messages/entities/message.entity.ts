import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ConversationDocument } from 'src/conversations/entities/conversation.entity';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';
import { MessageType } from 'src/core/enums/message.enum';
import { MessageStatus } from 'twilio/lib/rest/api/v2010/account/message';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
	organization: OrganizationDocument;
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' })
	conversation: ConversationDocument;

	// twilio data
	@Prop({})
	messageSid: string;
	@Prop({ default: null })
	waId: string;

	@Prop({})
	phoneNumber: string;

	@Prop({})
	content: string;
	@Prop({})
	type: MessageType;
	@Prop({})
	status: MessageStatus;

	@Prop({ type: Date })
	createdAt: Date;
	@Prop({ type: Date })
	updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.pre('save', function (next) {
	const now = new Date();

  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});