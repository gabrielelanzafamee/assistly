import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './entities/conversation.entity';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
	],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [MongooseModule, ConversationsService]
})
export class ConversationsModule {}
