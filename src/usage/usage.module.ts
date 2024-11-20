import { Module } from '@nestjs/common';
import { UsageService } from './usage.service';
import { UsageController } from './usage.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Usage, UsageSchema } from './entities/usage.entity';

@Module({
  imports: [
		MongooseModule.forFeature([{ name: Usage.name, schema: UsageSchema }])
	],
  controllers: [UsageController],
  providers: [UsageService],
  exports: [MongooseModule, UsageService]
})
export class UsageModule {}