import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { OrganizationsService } from 'src/organizations/organizations.service';

import { SignUpDto } from './dto/signup-auth.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModule: Model<User>,
    private jwtService: JwtService,
		private usersService: UsersService,
		private organizationsService: OrganizationsService
  ) {}

	async signup(body: SignUpDto) {
		// create organization
		const organization = await this.organizationsService.create(body.organization);
		const user = await this.usersService.create({ ...body.user }, organization._id);
		return {
			user,
			organization
		}
	}

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
		const user = await this.userModule.findOne({ email });
		
    if (user == null) return;
		
    const match = await bcrypt.compare(password, user.password);
		delete user.password; // make sure to delete the password

    if (!match) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    return user;
  }

  async signPayload(user): Promise<{ access_token: string }> {
    const payload = {
			id: user._id,
      email: user.email,
			role: user.role
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // async forgotPassword(body) {
  //   const user = await this.userModule.findOne({ username: body.username });

  //   if (user === null)
  //     return `Controlla la tua casella di posta.`;

  //   const uuid = randomUUID();
  //   const expires = moment().add(1, 'hour').toDate().getTime().toString();

  //   const session = await this.sessionRepository.save({
  //     uuid: uuid,
  //     expires: expires,
  //     email: body.email,
  //   });

  //   // const ok = await this.mailService.sendEmail(
  //   //   'noreply@cips.it',
  //   //   body.email,
  //   //   'Recupero Password - CIPS Area Resellers',
  //   //   `
  //   //   Gentile ${user.firstName} ${user.lastName},
  //   //   Abbiamo ricevuto la tua richiesta di recupero password per accedere all'Area Resellers di CIPS. Per favore, clicca sul seguente link per reimpostare la tua password:

  //   //   https://resellers.cips.it/recovery?session=${session.uuid}&expires=${expires}

  //   //   Assicurati di creare una password sicura e complessa per proteggere la tua privacy e la sicurezza delle tue informazioni personali.

  //   //   Se hai bisogno di ulteriore assistenza, non esitare a contattarci al seguente indirizzo e-mail: supporto@cips.it

  //   //   Cordiali saluti,
  //   //   Il team di CIPS
  //   //   `,
  //   // );

  //   // this.logger.info(`${ok ? 'SENT' : 'NOT SENT'} - New request for forgotten password from ${user.username} at ${moment().format("DD/MM/YYYY hh:mm:ss A")}, session: ${uuid}`, "AuthService.forgotPassword");

  //   return `Controlla la tua casella di posta.`;
  // }

  // async recoveryPassword(body) {
  //   const { sessionUuid, password } = body;

  //   const session = await this.sessionRepository.findOneBy({ uuid: sessionUuid });
  //   const user = await this.userRepository.findOneBy({ email: session.email });

  //   if (user === null) throw new BadRequestException('User not found');
  //   // check if session is expired
  //   if (new Date().getTime() >= parseInt(session.expires)) throw new ForbiddenException("Session expired")
    
  //   const result = await this.userRepository.update({ email: session.email }, { password: await bcrypt.hash(password, 10) });
    
  //   // delete session
  //   await this.sessionRepository.delete(session.id);

  //   // this.logger.info(`Password recovered from ${user.username} at ${moment().format("DD/MM/YYYY hh:mm:ss A")}, session: ${sessionUuid}`, "AuthService.recoveryPassword");
  //   return result;
  // }

  // async checkSession(sessionUuid) {
  //   const session = await this.sessionRepository.findOneBy({ uuid: sessionUuid });
  //   if (!session) throw new NotFoundException("Session expired")
  //   if (new Date().getTime() >= parseInt(session.expires)) throw new ForbiddenException("Session expired")
  //   return true;
  // }
}