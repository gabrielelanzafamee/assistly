import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAssistantDto } from './create-assistant.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAssistantDto extends PartialType(CreateAssistantDto) {
	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
