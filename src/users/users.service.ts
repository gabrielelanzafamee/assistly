import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { assertion } from 'src/core/utils/common.util';
import { UserRoles } from 'src/core/enums/user.enum';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private userModel: Model<User>
	) {}

	async create(user: CreateUserDto, organizationId): Promise<UserDocument> {
		const userExist = await this.userModel.findOne({ email: user.email });
		
		if (userExist) {
			throw new BadRequestException('User already exist');
		}
		
		// create user
		return await new this.userModel({
			...user,
			password: await bcrypt.hash(user.password, 10),
			organization: organizationId,
		}).save();
	}

	async list(organizationId: string): Promise<UserDocument[]> {
		return await this.userModel.find({ organization: organizationId, role: { $ne: UserRoles.SUPER_ADMIN } }, { password: 0 });
	}

	async get(id: string, organizationId: string): Promise<UserDocument> {
		const user = await this.userModel.findOne({ _id: id, organization: organizationId }, { password: 0 });
		
		if (user.role === UserRoles.SUPER_ADMIN) {
			return new this.userModel({
				_id: '0000',
				firstName: 'ADMIN',
				lastName: 'ADMIN',
				email: 'gabriele.lanzafame03@gmail.com',
				password: undefined,
				role: user.role,
				isActive: user.isActive,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			});
		}

		delete user.password;
		if ('password' in user) {
			user.password = undefined;
		}

		return user;
	}

	async update(id: string, organizationId: string, data: UpdateUserDto) {
		const user = await this.get(id, organizationId);
		assertion(user, new NotFoundException("User not found"));
		assertion(user.role !== UserRoles.SUPER_ADMIN, new UnauthorizedException("You can't update a Super Admin user"));

		if (data.password === '' || data.password === null || data.password === undefined) {
			delete data.password;
		} else {
			data.password = await bcrypt.hash(data.password, 10);
		}
		return await this.userModel.updateOne({ _id: id, organization: organizationId }, data);
	}

	async delete(id: string, organizationId: string) {
		const user = await this.get(id, organizationId);
		assertion(user, new NotFoundException("User not found"));
		assertion(user.role !== UserRoles.SUPER_ADMIN, new UnauthorizedException("You can't delete a Super Admin user"));
		return await this.userModel.deleteOne({ _id: id, organization: organizationId });
	}
}
