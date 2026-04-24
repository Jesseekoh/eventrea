import {
  Body,
  Controller,
  Post,
  Request,
  Res,
  UseGuards,
  Ip,
  Headers,
} from '@nestjs/common';
import { type FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { SignUpDTO } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async signIn(
    @Request() req,
    @Res({ passthrough: true }) res: FastifyReply,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const loginResult = await this.authService.login(req.user, userAgent, ip);
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
  async logout(@Request() req, @Res({ passthrough: true }) res: FastifyReply) {
    await this.authService.logout(req.user.sessionId);
    res.clearCookie('Authentication');
    res.clearCookie('Refresh');
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refreshTokens(
    @Request() req,
    @Res({ passthrough: true }) res: FastifyReply,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const tokens = await this.authService.refreshTokens(
      req.user.id,
      req.user.email,
      req.user.role,
      req.user.sessionId,
      userAgent,
      ip
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

  @Post('register')
  signUp(@Body() signUpDto: SignUpDTO) {
    return this.authService.signUp(signUpDto);
  }
}
