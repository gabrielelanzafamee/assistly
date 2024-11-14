import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class LoginDto {
	@MaxLength(50)
	@IsNotEmpty()
	@ApiProperty()
	email: string;

	@MaxLength(50)
	@IsNotEmpty()
	@ApiProperty()
	password: string;
}