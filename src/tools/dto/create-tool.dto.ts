import { IsNotEmpty, IsOptional, ValidateNested } from "class-validator";

export class CreateToolDto {
	@IsNotEmpty()
	assistant: string;
	@IsNotEmpty()
	name: string;
	@IsNotEmpty()
	description: string;
	@IsNotEmpty()
	endpoint: string;
	@IsOptional()
	endpointApiKey: string;
}
