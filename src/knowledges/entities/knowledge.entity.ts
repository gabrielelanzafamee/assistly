import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';
import { KnowledgeChunk } from 'src/core/interfaces/knowledges.interface';

export type KnowledgeDocument = HydratedDocument<Knowledge>;

@Schema()
export class Knowledge {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
	organization: OrganizationDocument;

	@Prop({})
	name: string;
	@Prop({ default: [] })
	chunks: KnowledgeChunk[];

	@Prop({ type: Date })
	createdAt: Date;
	@Prop({ type: Date })
	updatedAt: Date;
}

export const KnowledgeSchema = SchemaFactory.createForClass(Knowledge);

KnowledgeSchema.pre('save', function (next) {
	const now = new Date();

  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});