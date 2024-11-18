import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PhonesModule } from './phones/phones.module';
import { KnowledgesModule } from './knowledges/knowledges.module';
import { AssistantsModule } from './assistants/assistants.module';
import { MessagesModule } from './messages/messages.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ConversationsModule } from './conversations/conversations.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { CallsModule } from './calls/calls.module';
import { OpenAIModule } from './core/openai/openai.module';
import { ConfigService } from './core/config/config.service';
import { ToolsModule } from './tools/tools.module';
import { CustomersModule } from './customers/customers.module';
import { UsageModule } from './usage/usage.module';

const configService = new ConfigService();
const config = configService.getSystemConfig();

@Module({
  imports: [
		MongooseModule.forRoot(config.mongoUri),
		EventEmitterModule.forRoot(),
		OrganizationsModule,
		UsersModule,
		AuthModule,
		PhonesModule,
		KnowledgesModule,
		AssistantsModule,
		MessagesModule,
		ConversationsModule,
		WebhooksModule,
		WebsocketsModule,
		CallsModule,
		OpenAIModule,
		ToolsModule,
		CustomersModule,
		UsageModule
	],
  controllers: [],
  providers: [],
	exports: []
})
export class AppModule {}
