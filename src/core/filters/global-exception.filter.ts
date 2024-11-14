import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '../config/config.service';

export class RedirectException extends HttpException {
  constructor(url: string) {
    super(url, HttpStatus.SEE_OTHER);
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(
		private configService: ConfigService
	) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const utilsInfo = {
      timestemp: new Date().getTime(),
      path: request.url
    }

    if (exception instanceof RedirectException) {
      response.status(exception.getStatus()).redirect(exception.getResponse().toString());
    } else if (exception instanceof HttpException) {
      const error = (exception.getResponse() as any).message instanceof Array ? (exception.getResponse() as any).message[0] : exception.message;
			const result = { ok: false, error: error, ...utilsInfo };
			console.log('\n[Exception]:', JSON.stringify(result));
      response.status(exception.getStatus()).json(result);
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ ok: false, result: 'Oops, something went wrong', exception: this.configService.getSystemConfig().debug ? exception.stack : null, ...utilsInfo });
      console.log(exception.stack); // Just print the internal server error for debugging purposes
    }
  }
}