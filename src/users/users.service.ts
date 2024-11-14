import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
		return await this.userModel.find({ organization: organizationId });
	}

	async get(id: string, organizationId: string): Promise<UserDocument[]> {
		return await this.userModel.findOne({ _id: id, organization: organizationId });
	}

	async update(id: string, organizationId: string, user: UpdateUserDto) {
		return await this.userModel.updateOne({ _id: id, organization: organizationId }, user);
	}

	async delete(id: string, organizationId: string) {
		return await this.userModel.deleteOne({ _id: id, organization: organizationId });
	}
}
