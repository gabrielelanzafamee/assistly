import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blacklist } from '../entities/blacklist.entity';

@Injectable()
export class BlacklistService {
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds in milliseconds
  private readonly MAX_MESSAGES = 5;

  constructor(
    @InjectModel(Blacklist.name) private readonly blacklistModel: Model<Blacklist>,
  ) {}

  async isBlacklisted(organization: string, phoneNumber: string): Promise<boolean> {
    const record = await this.blacklistModel.findOne({ organization, phoneNumber });
    return !!record;
  }

  async addToBlacklist(organization: string, phoneNumber: string, reason: string): Promise<void> {
    await this.blacklistModel.updateOne(
      { organization, phoneNumber },
      {
        $set: { reason, blockedAt: new Date() },
        $unset: { count: '', windowStart: '' }, // Clear rate-limit data
      },
      { upsert: true },
    );
  }

  async checkRateLimit(organization: string, phoneNumber: string): Promise<boolean> {
    const now = Date.now();

    // Find the record in the blacklist
    const record = await this.blacklistModel.findOne({ organization, phoneNumber });

    if (!record) {
      // If no record exists, create a new one for rate limiting
      await this.blacklistModel.create({
				organization,
        phoneNumber,
        count: 1,
        windowStart: new Date(now),
      });
      return true;
    }

    // Check if the record is in a blacklist state
    if (record.blockedAt) {
      return false;
    }

    // Calculate elapsed time since the rate-limit window started
    const elapsedTime = now - (record.windowStart?.getTime() || 0);

    if (elapsedTime > this.RATE_LIMIT_WINDOW) {
      // Reset the window and count
      record.count = 1;
      record.windowStart = new Date(now);
      await record.save();
      return true;
    }

    if (record.count >= this.MAX_MESSAGES) {
      // Rate limit exceeded, add to blacklist
      await this.addToBlacklist(organization, phoneNumber, 'Rate limit exceeded');
      return false;
    }

    // Increment the count within the current window
    record.count += 1;
    await record.save();
    return true;
  }
}
