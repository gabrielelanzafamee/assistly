import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateOrganizationDto } from 'src/organizations/dto/create-organization.dto';

export class SignUpDto {
	@ApiProperty({ type: () => CreateUserDto })
	@ValidateNested()
	@Type(() => CreateUserDto)
	user: CreateUserDto;
	
	@ApiProperty({ type: () => CreateOrganizationDto })
	@ValidateNested()
	@Type(() => CreateOrganizationDto)
	organization: CreateOrganizationDto;
}