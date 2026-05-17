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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SignInDTO } from './dto/signin.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: SignInDTO })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Sets Authentication and Refresh cookies.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
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

  @ApiOperation({ summary: 'Log out the current user' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Logout successful. Clears authentication cookies.',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
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

  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
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

  @ApiOperation({ summary: 'Get all sessions for the current user' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'List of user sessions with current session marked',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
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

  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 409,
    description: 'A user with this email already exists',
  })
  @Post('register')
  signUp(@Body() signUpDto: SignUpDTO) {
    return this.authService.signUp(signUpDto);
  }
}
