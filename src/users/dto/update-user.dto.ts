import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { Optional } from '@nestjs/common';
import { IsStrongPassword } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@Optional()
	@IsStrongPassword()
	@ApiProperty()
	password: string;
}
