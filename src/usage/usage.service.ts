import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Usage } from 'src/usage/entities/usage.entity';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

@Injectable()
export class UsageService {
  private readonly pricing = {
    openai: {
      input_tokens: 0.000200,
      output_tokens: 0.000800,
      embedding_tokens: 0.000150,
      realtime_minutes: 0.0015
    },
		openai_realtime: {
      input_tokens: 0.1000,
      output_tokens: 0.2000,
    },
    elevenlabs: {
      characters: 0.00003
    },
    deepgram: {
      minutes: 0.0059
    },
    twilio: {
      inbound_minutes: 0.0085,
      outbound_minutes: 0.014,
      sms: 0.0080,
      mms: 0.0200,
      whatsapp: 0.005,
      phone_number: 1.0
    }
  };

  constructor(
    @InjectModel(Usage.name) private usageModel: Model<Usage>
  ) {}

  private calculateCost(service: string, type: string, quantity: number): number {
    const price = this.pricing[service][type];
    if (type.includes('tokens')) {
      return (quantity / 1000) * price;
    }
    return quantity * price;
  }

  async recordUsage(
    organizationId: string,
    service: string,
    type: string,
    quantity: number,
    metadata?: any
  ) {
		try {
			const cost = this.calculateCost(service, type, quantity);
			const record = new this.usageModel({
				organization: organizationId,
				timestamp: new Date(),
				service,
				type,
				quantity,
				cost,
				metadata
			});
			await record.save();
		} catch (err) { console.log(err); }
  }

  async getUsageByTimeRange(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ) {
    return this.usageModel.aggregate([
      {
        $match: {
          organization: new mongoose.Types.ObjectId(organizationId),
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            service: '$service',
            type: '$type'
          },
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: '$cost' }
        }
      }
    ]);
  }

  async getMonthlyUsage(organizationId: string, date: Date = new Date()) {
    return this.getUsageByTimeRange(
      organizationId,
      startOfMonth(date),
      endOfMonth(date)
    );
  }

  async getWeeklyUsage(organizationId: string, date: Date = new Date()) {
    return this.getUsageByTimeRange(
      organizationId,
      startOfWeek(date),
      endOfWeek(date)
    );
  }

  async getDailyBreakdown(organizationId: string, startDate: Date, endDate: Date) {
    return this.usageModel.aggregate([
      {
        $match: {
          organization: new mongoose.Types.ObjectId(organizationId),
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            service: '$service',
            type: '$type'
          },
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: '$cost' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);
  }
}