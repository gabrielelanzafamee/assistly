import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateAssistantDto {
	@IsNotEmpty()
	@ApiProperty()
	numberId: string;
	
	@ApiProperty()
	@IsNotEmpty()
	@MaxLength(50)
	name: string;
	@ApiProperty()
	@IsNotEmpty()
	@IsIn(['chat', 'sms', 'call', 'all', 'whatsapp'])
	type: string;
	
	@ApiProperty()
	@IsNotEmpty()
	@MaxLength(8000)
	instructions: string;
	@ApiProperty()
	@IsArray()
	knowledge: string[];
}