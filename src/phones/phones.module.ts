import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TwilioService } from 'src/core/services/twilio.service';
import { PhonesService } from './phones.service';
import { PhonesController } from './phones.controller';
import { Phone, PhoneSchema } from './entities/phone.entity';
import { ConfigService } from 'src/core/config/config.service';
import { ConfigModule } from 'src/core/config/config.module';
import { UsageModule } from 'src/usage/usage.module';

@Module({
  imports: [
		MongooseModule.forFeature([{ name: Phone.name, schema: PhoneSchema }]),
		ConfigModule,
		UsageModule
	],
  controllers: [PhonesController],
  providers: [PhonesService, TwilioService],
  exports: [MongooseModule, PhonesService]
})
export class PhonesModule {}