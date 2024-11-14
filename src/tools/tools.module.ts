import { forwardRef, Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tool, ToolSchema } from './entities/tool.entity';
import { HttpModule } from '@nestjs/axios';
import { OpenAIModule } from 'src/core/openai/openai.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Tool.name, schema: ToolSchema }]),
		HttpModule,
		forwardRef(() => OpenAIModule)
	],
  controllers: [ToolsController],
  providers: [ToolsService],
  exports: [ToolsService]
})
export class ToolsModule {}
