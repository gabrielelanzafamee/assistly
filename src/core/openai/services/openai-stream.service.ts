import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatCompletionChunk } from 'openai/resources';

@Injectable()
export class OpenAIStreamService {
	private partialResponseIndex: number = 0;
	private partialContent: { [key: string]: string } = {};

	constructor(private eventEmitter: EventEmitter2) {}

	async emitStreamResponse(
		clientId: string,
		content: string,
		startTime: number,
		interactionCount: number,
		finishReason: string,
	) {
		if (!this.partialContent[clientId]) {
			this.partialContent[clientId] = '';
		}

		this.partialContent[clientId] += content;

		const sentenceEnders = ['.', '!', '?', '•', '\n'];
		const currentContent = this.partialContent[clientId];

		const shouldEmit =
			finishReason === 'stop' ||
			sentenceEnders.some((ender) => currentContent.trim().endsWith(ender)) ||
			currentContent.length > 100;

		if (shouldEmit && currentContent.trim().length > 0) {
			const gptEndTime = new Date().getTime();
			const gptReply = {
				partialResponseIndex: this.partialResponseIndex,
				partialResponse: currentContent.trim(),
				time: gptEndTime - startTime,
			};

			console.log(
				`GPT Chunk Take ${gptEndTime - startTime}ms -> TTS: ${currentContent.trim()}`,
			);

			this.eventEmitter.emit(
				'openai.generation',
				clientId,
				gptReply,
				interactionCount,
			);

			this.partialResponseIndex++;
			this.partialContent[clientId] = '';
		}
	}

	processStreamChunk(chunk: ChatCompletionChunk) {
		const delta = chunk.choices[0]?.delta;
		const finishReason = chunk.choices[0]?.finish_reason || '';

		return {
			content: delta?.content || '',
			functionName: delta?.tool_calls?.[0]?.function?.name || '',
			functionArgs: delta?.tool_calls?.[0]?.function?.arguments || '',
			finishReason,
		};
	}

	cleanupClientContent(clientId: string) {
		delete this.partialContent[clientId];
	}

	resetIndex() {
		this.partialResponseIndex = 0;
	}
}
