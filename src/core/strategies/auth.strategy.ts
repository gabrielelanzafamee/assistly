import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


import { IRequest } from 'src/core/interfaces/request.interface';
import { User } from 'src/users/entities/user.entity';
import { Organization } from 'src/organizations/entities/organization.entity';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
		@InjectModel(Organization.name) private organizationModel: Model<Organization>
  ) { 
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: new ConfigService().getSystemConfig().jwtSecret,
			passReqToCallback: true
    });
  }

  async validate(req: IRequest, payload: any): Promise<any> {
    const user = await this.userModel.findOne({ _id: payload.id });
		
    if (!user) return null;
    if (!user.isActive) return null;
		
		const organization = await this.organizationModel.findOne({ _id: user.organization });

		user.password = null;
		
		req.user = user;
		req.organization = organization;

		return true;
  }
}