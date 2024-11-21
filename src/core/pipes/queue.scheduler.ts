import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { CallQueueService } from '../services/call-queue.service';
import { QueueProcessorService } from '../services/queue-processor.service';

@Injectable()
export class QueueScheduler {
  constructor(
    private readonly queueProcessorService: QueueProcessorService,
    private readonly callQueueService: CallQueueService,
  ) {}

  @Interval(5000)
  async handleQueueProcessing() {
    const organizations = await this.callQueueService.getOrganizationsWithQueues(); // Fetch all organizations with active queues
    for (const organizationId of organizations) {
      await this.queueProcessorService.processQueue(organizationId);
    }
  }
}
