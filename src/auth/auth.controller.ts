import { Body, Post, UnauthorizedException } from '@nestjs/common';
import { ApiController } from 'src/core/decorators/api.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-auth.dto';
import { successResponse } from 'src/core/utils/responses.util';
import { SignUpDto } from './dto/signup-auth.dto';
import { ApiTags } from '@nestjs/swagger';


@ApiController('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const result = await this.authService.validateUser(body.email, body.password);
    
    if (!result) {
      throw new UnauthorizedException();
    }

    const auth = await this.authService.signPayload(result);
    return successResponse(auth);
  }

	@Post('signup')
	async signup(@Body() body: SignUpDto) {
		const result = await this.authService.signup(body);
		return successResponse(result);
	}

  // @Post('/security/forgot')
	// @HttpCode(200)
  // async forgotPassword(@Body() body) {
  //   const result = await this.authService.forgotPassword(body);
  //   return successResponse(result);
  // }

  // @Get(`/security/session/:id`)
	// @HttpCode(200)
  // async checkSession(@Param('id') id) {
  //   const result = await this.authService.checkSession(id);
  //   return successResponse(result);
  // }

  // @Post('/recovery/password')
	// @HttpCode(200)
  // async recoveryPassword(@Body() body) {
  //   const result = await this.authService.recoveryPassword(body);
  //   return successResponse(result);
  // }
}