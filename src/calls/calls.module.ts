import { Module } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Call, CallSchema } from './entities/call.entity';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Call.name, schema: CallSchema }]),
	],
  controllers: [CallsController],
  providers: [CallsService],
  exports: [MongooseModule, CallsService]
})
export class CallsModule {}
