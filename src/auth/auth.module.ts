import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthStrategy } from 'src/core/strategies/auth.strategy';

import { UsersModule } from 'src/users/users.module';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigService } from 'src/core/config/config.service';

const configService = new ConfigService();
const config = configService.getSystemConfig();


@Module({
  imports: [
    UsersModule,
		OrganizationsModule,
    PassportModule,
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: config.jwtExpiration }
    })
  ],
  providers: [AuthService, AuthStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}