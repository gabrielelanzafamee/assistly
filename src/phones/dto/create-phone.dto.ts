import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class CreatePhoneDto {
	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	friendlyName: string;

	@IsNotEmpty()
	@Matches(/^\+[1-9]\d{1,14}$/, {
		message: 'The phone number doesn\'t follow the correct format.'
	})
	@ApiProperty()
	phoneNumber: string;
}