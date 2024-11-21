import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssistantsModule } from 'src/assistants/assistants.module';
import { KnowledgesModule } from 'src/knowledges/knowledges.module';
import { MessagesModule } from 'src/messages/messages.module';
import { PhonesModule } from 'src/phones/phones.module';
import { UsersModule } from 'src/users/users.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './services/webhooks.service';
import { TwilioService } from 'src/core/services/twilio.service';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { CallsModule } from 'src/calls/calls.module';
import { OpenAIModule } from 'src/core/openai/openai.module';
import { ConfigModule } from 'src/core/config/config.module';
import { ToolsModule } from 'src/tools/tools.module';
import { UsageModule } from 'src/usage/usage.module';
import { WebhooksCallsService } from './services/webhooks-calls.service';
import { WebhooksSmsService } from './services/webhooks-sms.service';
import { WebhooksWhatsappService } from './services/webhooks-whatsapp.service';
import { WebhooksCommonService } from './services/webhooks-common.service';
import { CustomersModule } from 'src/customers/customers.module';
import { BlacklistService } from 'src/core/services/blacklist.service';
import { Blacklist, BlacklistSchema } from 'src/core/entities/blacklist.entity';
import { CallQueue, CallQueueSchema } from 'src/core/entities/queue-call.entity';
import { CallQueueService } from 'src/core/services/call-queue.service';
import { QueueScheduler } from 'rxjs/internal/scheduler/QueueScheduler';


@Module({
  imports: [
		MongooseModule.forFeature([{ name: Blacklist.name, schema: BlacklistSchema }]),
		MongooseModule.forFeature([{ name: CallQueue.name, schema: CallQueueSchema }]),
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
		ToolsModule,
		UsageModule,
		CustomersModule
	],
  controllers: [WebhooksController],
  providers: [
		WebhooksService,
		TwilioService,
		WebhooksCallsService,
		WebhooksSmsService,
		WebhooksWhatsappService,
		WebhooksCommonService,
		BlacklistService,
		CallQueueService,
		QueueScheduler
	],
  exports: [MongooseModule, WebhooksService]
})
export class WebhooksModule {
	// configure(consumer: MiddlewareConsumer) {
			// consumer.apply(TwilioMiddleware).forRoutes(WebhooksController);
	// }
}