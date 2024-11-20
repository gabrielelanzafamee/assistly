import { Module } from '@nestjs/common';
import { WebsocketsCustomService } from './services/websockets-custom.service';
import { WebsocketsCustomGateway } from './gateways/websockets-custom.gateway';
import { TextToSpeechService } from 'src/core/services/tts.service';
import { TranscriptionService } from 'src/core/services/transcription.service';
import { StreamService } from 'src/core/services/stream.service';
import { AssistantsModule } from 'src/assistants/assistants.module';
import { CallsModule } from 'src/calls/calls.module';
import { KnowledgesModule } from 'src/knowledges/knowledges.module';
import { WebsocketsOpenAIGateway } from './gateways/websockets-openai.gateway';
import { WebsocketsOpenaiService } from './services/websockets-openai.service';
import { OpenAIModule } from 'src/core/openai/openai.module';
import { ConfigModule } from 'src/core/config/config.module';
import { UsageModule } from 'src/usage/usage.module';

@Module({
	imports: [
		AssistantsModule,
		CallsModule,
		KnowledgesModule,
		OpenAIModule,
		ConfigModule,
		UsageModule
	],
  providers: [
		WebsocketsCustomGateway,
		WebsocketsOpenAIGateway,
		WebsocketsCustomService,
		WebsocketsOpenaiService,
		TextToSpeechService,
		TranscriptionService,
		StreamService
	],
})
export class WebsocketsModule {}