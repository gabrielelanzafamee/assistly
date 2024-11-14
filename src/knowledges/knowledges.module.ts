import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { Knowledge, KnowledgeSchema } from './entities/knowledge.entity';
import { KnowledgesController } from './knowledges.controller';
import { KnowledgesService } from './knowledges.service';
import { OpenAIModule } from 'src/core/openai/openai.module';

@Module({
  imports: [
		OrganizationsModule,
		OpenAIModule,
		MongooseModule.forFeature([{ name: Knowledge.name, schema: KnowledgeSchema }]),
	],
  controllers: [KnowledgesController],
  providers: [KnowledgesService],
  exports: [MongooseModule, KnowledgesService]
})
export class KnowledgesModule {}