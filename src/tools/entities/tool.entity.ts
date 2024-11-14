import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AssistantDocument } from 'src/assistants/entities/assistant.entity';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';

export type ToolDocument = HydratedDocument<Tool>;

@Schema()
export class Tool {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
	organization: OrganizationDocument;

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Assistant' })
	assistant: AssistantDocument;

	@Prop({})
	name: string;
	@Prop({})
	description: string;
	@Prop({})
	endpoint: string;
	@Prop({})
	endpointApiKey: string;

	@Prop({ type: Object })
	vectors: {
		name: number[],
		description: number[],
	}

	// @Prop({ type: Object })
	// openaiTool: {
	// 	name: string,
	// 	description: string,
	// 	parameters: object,
	// 	required: string[]
	// };

	@Prop({ type: Date })
	createdAt: Date;
	@Prop({ type: Date })
	updatedAt: Date;
}

export const ToolSchema = SchemaFactory.createForClass(Tool);

ToolSchema.pre('save', function (next) {
	const now = new Date();

  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});