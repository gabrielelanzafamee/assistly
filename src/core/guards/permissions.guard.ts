import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<string>('permission', context.getHandler());
    
    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return user[permission];
  }
}