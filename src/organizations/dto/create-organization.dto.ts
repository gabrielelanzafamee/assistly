import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsPhoneNumber, MaxLength } from 'class-validator';
import { OrganizationPlans } from 'src/core/enums/organization.enum';
import { COUNTRY_INFO } from 'src/core/enums/countryCode.enum';

export class CreateOrganizationDto {
	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	name: string;
	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	type: string;

	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	address: string;
	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	zipcode: string;
	@IsNotEmpty()
	@MaxLength(150)
	@IsIn(Object.keys(COUNTRY_INFO).map(key => COUNTRY_INFO[key].name))
	@ApiProperty()
	country: string;
	@IsNotEmpty()
	@IsIn(Object.keys(COUNTRY_INFO))
	@MaxLength(50)
	@ApiProperty()
	countryCode: string;
	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty()
	city: string;

	@IsIn(Object.keys(OrganizationPlans).map(k => OrganizationPlans[k]))
	@ApiProperty()
	plan: string;

	@IsNotEmpty()
	@MaxLength(50)
	@IsPhoneNumber()
	@ApiProperty()
	phoneNumber: string;
	@IsNotEmpty()
	@MaxLength(50)
	@IsEmail()
	@ApiProperty()
	email: string;

	@IsNotEmpty()
	@MaxLength(50)
	@IsOptional()
	@IsBoolean()
	@ApiProperty()
	isActive: boolean;

	@MaxLength(50)
	@IsOptional()
	@ApiProperty()
	openaiApiKey: string;
	@MaxLength(50)
	@IsOptional()
	@ApiProperty()
	elevenLabsApiKey: string;
	@MaxLength(50)
	@IsOptional()
	@ApiProperty()
	calendlyUrl: string;
}