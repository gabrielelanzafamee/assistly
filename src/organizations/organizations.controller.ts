import { Body, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiController } from 'src/core/decorators/api.decorator';
import { Authenticated, Roles } from 'src/core/decorators/auth.decorator';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@ApiController('organizations')
@ApiTags('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

	@Post('create')
	@Roles('admin')
	@Authenticated()
	async createOrganization(@Body() body: CreateOrganizationDto) {
		return await this.organizationsService.create(body);
	}
}
