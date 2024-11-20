import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ConfigService } from 'src/core/config/config.service';
import { RateLimitService } from './rate-limit.service';
import {
	ChatCompletion,
	ChatCompletionCreateParams,
	ChatCompletionTool,
	EmbeddingCreateParams,
} from 'openai/resources';
import { KnowledgeChunk } from 'src/core/interfaces/knowledges.interface';
import { ToolsService } from 'src/tools/tools.service';
import { ITool } from 'src/tools/interfaces/tools.interface';
import { firstValueFrom } from 'rxjs';
import { OpenAIStreamService } from './openai-stream.service';
import { OpenAIFunctionService } from './openai-function.service';
import { ToolRegistryService } from './tool-registry.service';
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk } from 'openai/resources';
import { UsageService } from '../../../usage/usage.service';


// integrate here usage save infomation

@Injectable()
export class OpenAIService {
	private readonly client: OpenAI;
	private readonly model: string;
	private readonly embModel: string;

	constructor(
		private configService: ConfigService,
		private rateLimitService: RateLimitService,
		private streamService: OpenAIStreamService,
		private functionService: OpenAIFunctionService,
		private toolRegistry: ToolRegistryService,
		@Inject(forwardRef(() => ToolsService)) private toolsService: ToolsService,
		private usageService: UsageService
	) {
		const config = this.configService.getOpenAIConfig();
		this.client = new OpenAI({ apiKey: config.apiKey });
		this.model = config.model;
		this.embModel = config.embeddingModel;
	}

	private async injectKnowledgeContext(
		messages: Array<any>,
		knowledges: KnowledgeChunk[],
		tool: ITool,
	): Promise<void> {
		const system = messages[0].content;
		const context = knowledges.map((k) => k.content).join('\n\n');
		messages[0].content = `${system}\n\nContext:\n\n${context}\n\nImportant note: Limit responses to 500 characters. Ask if more info is needed.`;

		if (!tool || tool.similarity < 0.5) return;

		const { data, status } = await firstValueFrom(
			this.toolsService.fetchData(tool),
		);

		if (status === 200) {
			messages[0].content = `${messages[0].content}\n\nBackend User Data: ${JSON.stringify(data)}`;
		}
	}

	async *chat(
		messages: Array<any>,
		config: Partial<ChatCompletionCreateParams>,
		knowledges: KnowledgeChunk[] = [],
		utool: ITool = null,
		organizationId: string = null
	): any {
		await this.injectKnowledgeContext(messages, knowledges, utool);

		if (!config.stream) {
			const response = await this.rateLimitService.handleRateLimitedRequest(() =>
				this.client.chat.completions.create({
					model: config.model || this.model,
					messages,
					tools: this.toolRegistry.getToolSchemas() as ChatCompletionTool[],
					...config,
				})
			) as ChatCompletion;

			if (organizationId) {
				await this.usageService.recordUsage(organizationId, 'openai', 'input_tokens', response.usage.prompt_tokens);
				await this.usageService.recordUsage(organizationId, 'openai', 'output_tokens', response.usage.completion_tokens);
			}

			return response;
		}

		const stream = await this.rateLimitService.handleRateLimitedRequest(() =>
			this.client.chat.completions.create({
					model: config.model || this.model,
					messages,
					tools: this.toolRegistry.getToolSchemas() as ChatCompletionTool[],
					...config,
				})
		) as Stream<ChatCompletionChunk>;

		let totalInputTokens = 0;
		let totalOutputTokens = 0;
		let isFirstChunk = true;

		try {
			for await (const chunk of stream) {
				if (isFirstChunk && chunk.usage) {
					totalInputTokens = chunk.usage.prompt_tokens;
					isFirstChunk = false;
				}
				if (chunk.usage?.completion_tokens) {
					totalOutputTokens += chunk.usage.completion_tokens;
				}
				yield chunk;
			}
		} finally {
			if (organizationId && (totalInputTokens > 0 || totalOutputTokens > 0)) {
				await Promise.all([
					totalInputTokens > 0 && this.usageService.recordUsage(organizationId, 'openai', 'input_tokens', totalInputTokens),
					totalOutputTokens > 0 && this.usageService.recordUsage(organizationId, 'openai', 'output_tokens', totalOutputTokens)
				]);
			}
		}
	}

	async createVector(
		input: string,
		params: Partial<EmbeddingCreateParams> = {},
		organizationId: string = null
	): Promise<any> {
		try {
			const response = await this.rateLimitService.handleRateLimitedRequest(() =>
				this.client.embeddings.create({
					model: params.model || this.embModel,
					input,
					encoding_format: 'float',
					...params,
				}),
			);

			if (organizationId && response.usage?.total_tokens) {
				await this.usageService.recordUsage(
					organizationId,
					'openai',
					'embedding_tokens',
					response.usage.total_tokens
				);
			}

			return response;
		} catch (error) {
			console.error('Error creating vector embedding:', error);
			throw error;
		}
	}

	async chatEventStream(
		interactionCount: number,
		messages: object[],
		config: Partial<ChatCompletionCreateParams>,
		clientId: string,
		knowledges: KnowledgeChunk[] = [],
		tool: ITool = null,
		organizationId: string = null
	) {
		const gptStartTime = new Date().getTime();
		
		try {
			this.streamService.cleanupClientContent(clientId);

			for await (const chunk of this.streamChatCompletion(
				messages,
				config,
				knowledges,
				tool,
				{ organizationId }
			)) {
				if (chunk.error) {
					await this.streamService.emitStreamResponse(
						clientId,
						chunk.error,
						gptStartTime,
						interactionCount,
						'error',
					);
					continue;
				}

				await this.streamService.emitStreamResponse(
					clientId,
					chunk.content,
					gptStartTime,
					interactionCount,
					chunk.finishReason,
				);
			}
		} catch (error) {
			console.error('Error in chat stream:', error);
			await this.streamService.emitStreamResponse(
				clientId,
				'Sorry, an error occurred.',
				gptStartTime,
				interactionCount,
				'error',
			);
		} finally {
			this.streamService.cleanupClientContent(clientId);
		}
	}

	async *streamChatCompletion(
		messages: object[],
		config: Partial<ChatCompletionCreateParams>,
		knowledges: KnowledgeChunk[] = [],
		tool: ITool = null,
		params: any = null,
	): AsyncGenerator<{
		content: string;
		finishReason: string;
		error?: string;
	}> {
		let functionName = '';
		let functionArgs = '';

		try {
			const stream = await this.handleChatStream(
				messages,
				config,
				knowledges,
				tool,
				params?.organizationId
			);

			for await (const chunk of stream) {
				const {
					content,
					functionName: fn,
					functionArgs: args,
					finishReason,
				} = this.streamService.processStreamChunk(chunk);

				if (fn) functionName = fn;
				if (args) functionArgs += args;

				if (finishReason === 'tool_calls' && functionName && functionArgs) {
					try {
						const functionResult = await this.functionService.handleFunctionCall(
							functionName,
							functionArgs,
							params,
						);

						messages.push({
							role: 'function',
							name: functionName,
							content: JSON.stringify(functionResult),
						});

						const continuationStream = this.streamChatCompletion(
							messages,
							config,
							knowledges,
							tool,
							params
						);

						for await (const token of continuationStream) {
							yield token;
						}

						return;
					} catch (error) {
						console.error(`Function call error:`, error);
						yield {
							content: '',
							finishReason: 'error',
							error: `Function ${functionName} failed: ${error.message}`,
						};
						return;
					}
				}

				if (content) {
					yield { content, finishReason };
				}
			}
		} catch (error) {
			console.error('Stream chat completion error:', error);
			yield {
				content: '',
				finishReason: 'error',
				error: error.message,
			};
		}
	}

	private async handleChatStream(
		messages: object[],
		config: Partial<ChatCompletionCreateParams>,
		knowledges: KnowledgeChunk[] = [],
		tool: ITool = null,
		organizationId: string = null
	): Promise<Stream<ChatCompletionChunk>> {
		return (await this.chat(
			messages,
			{
				...config,
				stream: true,
			},
			knowledges,
			tool,
			organizationId
		)) as Stream<ChatCompletionChunk>;
	}

	async resetWSData() {
		this.streamService.resetIndex();
	}
}
