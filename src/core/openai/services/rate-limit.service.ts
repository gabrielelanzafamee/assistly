import { Injectable } from '@nestjs/common';
import { delay } from 'src/core/utils/delay.util';

@Injectable()
export class RateLimitService {
  private readonly maxRetries = 5;

  async handleRateLimitedRequest<T>(requestFn: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw new Error(`Failed after ${this.maxRetries} attempts`);
      }

      const retryDelay = this.getRetryDelayFromHeaders(error?.headers);
      if (retryDelay) {
        console.warn(`Rate limit reached. Retrying in ${retryDelay / 1000}s...`);
        await delay(retryDelay);
      } else {
        console.warn(`Error occurred. Retrying... Attempts left: ${this.maxRetries - attempt}`);
        await delay(attempt * 1000); // Exponential backoff
      }

      return this.handleRateLimitedRequest(requestFn, attempt + 1);
    }
  }

  private getRetryDelayFromHeaders(headers: any): number | null {
    if (!headers) return null;

    const remainingRequests = parseInt(headers['x-ratelimit-remaining-requests'], 10);
    const remainingTokens = parseInt(headers['x-ratelimit-remaining-tokens'], 10);
    const resetRequests = this.parseDuration(headers['x-ratelimit-reset-requests']);
    const resetTokens = this.parseDuration(headers['x-ratelimit-reset-tokens']);

    if (remainingRequests === 0) return resetRequests || 1000;
    if (remainingTokens === 0) return resetTokens || 60000;

    return null;
  }

  private parseDuration(duration: string): number | null {
    const secondsMatch = duration.match(/(\d+)s/);
    const minutesMatch = duration.match(/(\d+)m/);

    const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

    return seconds * 1000 + minutes * 60000;
  }
}
