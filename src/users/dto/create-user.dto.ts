import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsStrongPassword, MaxLength } from 'class-validator';
import { UserRoles } from 'src/core/enums/user.enum';

export class CreateUserDto {
	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	firstName: string;

	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	lastName: string;

	@IsNotEmpty()
	@MaxLength(50)
	@IsEmail()
	@ApiProperty()
	email: string;
	
	@IsNotEmpty()
	@MaxLength(50)
	@IsStrongPassword()
	@ApiProperty()
	password: string;

	@IsNotEmpty()
	@MaxLength(50)
	@IsOptional()
	@ApiProperty()
	role?: UserRoles;
}