import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AssistantDocument } from 'src/assistants/entities/assistant.entity';
import { MessageDocument } from 'src/messages/entities/message.entity';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';
import { PhoneDocument } from 'src/phones/entities/phone.entity';
import { ConversationStatus, ConversationType } from 'src/core/enums/conversation.enum';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema()
export class Conversation {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
	organization: OrganizationDocument;
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Assistant' })
	assistant: AssistantDocument;
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Phone' })
	phone: PhoneDocument;
	
	@Prop({})
	from: string;
		
	@Prop({})
	status: ConversationStatus; // open | closed | pending

	@Prop({ default: true })
	automaticReply: boolean;

	@Prop({})
	type: ConversationType; // call | sms | whatsapp
	
	@Prop({ type: Date })
	createdAt: Date;
	@Prop({ type: Date })
	updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.pre('save', function (next) {
	const now = new Date();

  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});