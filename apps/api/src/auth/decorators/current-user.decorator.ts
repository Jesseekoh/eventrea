import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@eventrea/prisma';

export interface JwtUser {
  sub: string;
  email: string;
  role: Role;
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtUser;
    return user;
  },
);
