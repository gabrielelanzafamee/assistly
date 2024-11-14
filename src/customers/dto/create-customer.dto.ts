import { IsString, IsEmail, IsOptional, IsEnum, IsDate, IsNumber, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class PreviousQuery {
  @IsDate()
  timestamp: Date;

  @IsString()
  query: string;

  @IsString()
  resolution: string;
}

class Preferences {
  @IsArray()
  @IsString({ each: true })
  productInterests: string[];

  @IsString()
  communicationFrequency: string;

  @IsOptional()
  @IsString()
  specialNeeds?: string;
}

export class CreateCustomerDto {
  @IsString()
  organization: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsEnum(['email', 'phone', 'sms', 'whatsapp'])
	preferredContactMethod?: 'email' | 'phone' | 'sms' | 'whatsapp';

  @IsString()
  preferredLanguage: string;

  @IsDate()
  @Type(() => Date)
  firstInteractionDate: Date;

  @IsDate()
  @Type(() => Date)
  lastInteractionDate: Date;

  @IsNumber()
  interactionCount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreviousQuery)
  previousQueries: PreviousQuery[];

  @IsObject()
  @ValidateNested()
  @Type(() => Preferences)
  preferences: Preferences;

  @IsEnum(['active', 'inactive', 'blocked', 'pending'])
  customerStatus: 'active' | 'inactive' | 'blocked' | 'pending';

  @IsEnum(['basic', 'premium', 'enterprise'])
  serviceLevel: 'basic' | 'premium' | 'enterprise';

  @IsNumber()
  openTickets: number;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
