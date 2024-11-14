import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssistantsModule } from 'src/assistants/assistants.module';
import { KnowledgesModule } from 'src/knowledges/knowledges.module';
import { MessagesModule } from 'src/messages/messages.module';
import { PhonesModule } from 'src/phones/phones.module';
import { UsersModule } from 'src/users/users.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { TwilioService } from 'src/core/services/twilio.service';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { CallsModule } from 'src/calls/calls.module';
import { OpenAIModule } from 'src/core/openai/openai.module';
import { ConfigModule } from 'src/core/config/config.module';
import { ToolsModule } from 'src/tools/tools.module';


@Module({
  imports: [
		MongooseModule,
		UsersModule,
		AssistantsModule,
		PhonesModule,
		KnowledgesModule,
		MessagesModule,
		ConversationsModule,
		CallsModule,
		OpenAIModule,
		ConfigModule,
		ToolsModule
	],
  controllers: [WebhooksController],
  providers: [WebhooksService, TwilioService],
  exports: [MongooseModule, WebhooksService]
})
export class WebhooksModule {
	// configure(consumer: MiddlewareConsumer) {
			// consumer.apply(TwilioMiddleware).forRoutes(WebhooksController);
	// }
}