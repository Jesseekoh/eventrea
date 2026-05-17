import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  Ip,
  Get,
  Headers,
} from '@nestjs/common';
import { type FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { SignUpDTO } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser, type JwtUser } from './decorators/current-user.decorator';
import { type User } from '@eventrea/prisma';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async signIn(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: FastifyReply,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const loginResult = await this.authService.login(user, userAgent, ip);
    res.setCookie('Authentication', loginResult.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });
    res.setCookie('Refresh', loginResult.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return loginResult;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: JwtUser,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    await this.authService.logout(user.sessionId);
    res.clearCookie('Authentication');
    res.clearCookie('Refresh');
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refreshTokens(
    @CurrentUser() user: JwtUser,
    @Res({ passthrough: true }) res: FastifyReply,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const tokens = await this.authService.refreshTokens(
      user.sub,
      user.email,
      user.role,
      user.sessionId,
      userAgent,
      ip,
    );
    res.setCookie('Authentication', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });
    res.setCookie('Refresh', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return { message: 'Tokens refreshed', ...tokens };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getUserSessions(@CurrentUser() user: JwtUser) {
    const sessions = await this.authService.getUserSessions(user.sub);
    return sessions.map((session) => {
      const { refreshToken, ...rest } = session;
      return {
        ...rest,
        isCurrent: session.id === user.sessionId,
      };
    });
  }
  @Post('register')
  signUp(@Body() signUpDto: SignUpDTO) {
    return this.authService.signUp(signUpDto);
  }
}
