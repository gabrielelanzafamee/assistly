import { Get, Param, Delete, Req } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { ApiController } from 'src/core/decorators/api.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Authenticated } from 'src/core/decorators/auth.decorator';
import { IRequest } from 'src/core/interfaces/request.interface';
import { successResponse } from 'src/core/utils/responses.util';

@ApiController('customers')
@ApiTags('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

	@Get()
	@Authenticated()
	async list(@Req() req: IRequest) {
		const result = await this.customersService.list(req.organization._id.toString());
		return successResponse(result, 'List customers fetched');
	}

	@Get(':id')
	@Authenticated()
	async single(@Req() req: IRequest, @Param('id') id: string) {
		const result = await this.customersService.get(id, req.organization._id.toString());
		return successResponse(result, 'Single customer fetched');
	}

	@Delete(':id')
	@Authenticated()
	async delete(@Req() req: IRequest, @Param('id') id: string) {
		const result = await this.customersService.delete(id, req.organization._id.toString());
		return successResponse(result, 'Customer deleted');
	}
}
