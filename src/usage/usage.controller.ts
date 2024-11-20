import { UsageService } from './usage.service';
import { ApiController } from 'src/core/decorators/api.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiController('usages')
@ApiTags('usages')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}
}
