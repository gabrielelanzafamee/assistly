import { Injectable } from '@nestjs/common';
import { ToolRegistryService } from './tool-registry.service';

@Injectable()
export class OpenAIFunctionService {
	constructor(private toolRegistry: ToolRegistryService) {}

	async handleFunctionCall(
		functionName: string,
		functionArgs: string,
		params: any,
	) {
		try {
			const args = JSON.parse(functionArgs);
			const tool = this.toolRegistry.getTool(functionName);

			if (!tool) {
				return {
					error: true,
					message: `Unknown function: ${functionName}`,
				};
			}

			return await tool.execute(args, params);
		} catch (error) {
			console.error(`Error in function ${functionName}:`, error);
			return {
				error: true,
				message: `Failed to process function ${functionName}: ${error.message}`,
			};
		}
	}
}
