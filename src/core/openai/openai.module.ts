import { forwardRef, Module } from '@nestjs/common';
import { OpenAIService } from './services/openai.service';
import { OpenAIStreamService } from './services/openai-stream.service';
import { OpenAIFunctionService } from './services/openai-function.service';
import { RateLimitService } from './services/rate-limit.service';
import { ToolRegistryService } from './services/tool-registry.service';
import { ToolsModule } from 'src/tools/tools.module';
import { CustomersModule } from 'src/customers/customers.module';
import { ConfigModule } from 'src/core/config/config.module';
import { CustomerTool } from './tools/customer.tool';
import { UsageModule } from 'src/usage/usage.module';

@Module({
	imports: [ConfigModule, forwardRef(() => ToolsModule), CustomersModule, UsageModule],
	providers: [
		OpenAIService,
		OpenAIStreamService,
		OpenAIFunctionService,
		RateLimitService,
		ToolRegistryService,
		CustomerTool,
		{
			provide: 'TOOL_INITIALIZATION',
			useFactory: (
				toolRegistry: ToolRegistryService,
				customerTool: CustomerTool,
			) => {
				toolRegistry.registerTool(customerTool);
			},
			inject: [ToolRegistryService, CustomerTool],
		},
	],
	exports: [OpenAIService],
})
export class OpenAIModule {}
