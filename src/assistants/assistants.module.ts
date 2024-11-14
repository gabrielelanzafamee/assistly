import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { PhonesModule } from 'src/phones/phones.module';
import { Assistant, AssistantSchema } from './entities/assistant.entity';
import { AssistantsService } from './assistants.service';
import { AssistantsController } from './assistants.controller';

@Module({
  imports: [
		MongooseModule.forFeature([{ name: Assistant.name, schema: AssistantSchema }]),
		OrganizationsModule,
		PhonesModule,
	],
  controllers: [AssistantsController],
  providers: [AssistantsService],
  exports: [MongooseModule, AssistantsService]
})
export class AssistantsModule {}