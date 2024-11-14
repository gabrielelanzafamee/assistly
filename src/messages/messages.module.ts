import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { PhonesModule } from 'src/phones/phones.module';
import { TwilioService } from 'src/core/services/twilio.service';
import { MessagesController } from './messages.controller';
import { OpenAIModule } from 'src/core/openai/openai.module';
import { ConfigModule } from 'src/core/config/config.module';


@Module({
  imports: [
		MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
		ConversationsModule,
		PhonesModule,
		OpenAIModule,
		ConfigModule
	],
  controllers: [MessagesController],
	providers: [MessagesService, TwilioService],
  exports: [MongooseModule, MessagesService]
})
export class MessagesModule {}