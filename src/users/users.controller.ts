import { Body, Get, Param, Post, Req } from '@nestjs/common';
import { ApiController } from 'src/core/decorators/api.decorator';
import { IRequest } from 'src/core/interfaces/request.interface';
import { successResponse } from 'src/core/utils/responses.util';
import { Authenticated } from 'src/core/decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiController('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

	@Post()
	@Authenticated()
	async createUser(@Req() req: IRequest, @Body() body: CreateUserDto) {
		const result = await this.usersService.create(body, req.organization._id.toString());
		return successResponse(result);
	}

	@Get()
	async list(@Req() req: IRequest) {
		const results = await this.usersService.list(req.organization._id.toString());
		return successResponse(results, 'Users list retrieved successfully')
	}

	@Get(':id')
	async single(@Req() req: IRequest, @Param('id') id: string) {
		const result = await this.usersService.get(id, req.organization._id.toString());
		return successResponse(result, 'User retrieved successfully')
	}


	@Get(':id')
	async update(@Req() req: IRequest, @Param('id') id: string, @Body() body: UpdateUserDto) {
		const result = await this.usersService.update(id, req.organization._id.toString(), body);
		return successResponse(result, 'User updated successfully')
	}

	@Get(':id')
	async delete(@Req() req: IRequest, @Param('id') id: string) {
		const result = await this.usersService.delete(id, req.organization._id.toString());
		return successResponse(result, 'User deleted successfully')
	}

	@Get('/user/info')
	@Authenticated()
	async getInfo(@Req() req: IRequest) {
		return successResponse(req.user);
	}
}
