import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateKnowledgeDto {
	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	name: string;
}