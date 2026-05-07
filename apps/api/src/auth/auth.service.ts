import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDTO } from './dto/signin.dto';
import * as argon2 from 'argon2';
import { SignUpDTO } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@eventrea/prisma';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findUser({ email });
    if (user && (await argon2.verify(user.password, pass))) {
      const { password, ...result } = user;

      return result;
    }
    return null;
  }

  async getTokens(
    userId: string,
    email: string,
    role: string,
    sessionId: string,
  ) {
    const payload = { sub: userId, email, role, sessionId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      }),
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async createSession(userId: string, userAgent?: string, ipAddress?: string) {
    return this.prisma.session.create({
      data: {
        userId,
        refreshToken: '', // we update this right after
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async login(user: User, userAgent?: string, ipAddress?: string) {
    const session = await this.createSession(user.id, userAgent, ipAddress);
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      session.id,
    );
    const hashedRefreshToken = await argon2.hash(tokens.refresh_token);

    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return { message: 'Login successful', ...tokens };
  }

  async logout(sessionId: string) {
    if (sessionId) {
      await this.prisma.session
        .delete({ where: { id: sessionId } })
        .catch(() => {});
    }
  }

  async validateRefreshToken(sessionId: string, refreshToken: string) {
    if (!sessionId) return null;
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
    if (!session) return null;
    if (session.expiresAt < new Date()) {
      await this.prisma.session
        .delete({ where: { id: sessionId } })
        .catch(() => {});
      return null;
    }
    const refreshTokenMatches = await argon2.verify(
      session.refreshToken,
      refreshToken,
    );
    if (refreshTokenMatches) {
      return { ...session.user, sessionId: session.id };
    }
    return null;
  }

  async refreshTokens(
    userId: string,
    email: string,
    role: string,
    oldSessionId: string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    await this.prisma.session
      .delete({ where: { id: oldSessionId } })
      .catch(() => {});

    const session = await this.createSession(userId, userAgent, ipAddress);
    const tokens = await this.getTokens(userId, email, role, session.id);
    const hashedRefreshToken = await argon2.hash(tokens.refresh_token);

    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return tokens;
  }
  async signUp(signUpDto: SignUpDTO) {
    const existingUser = await this.userService.findUser({
      email: signUpDto.email,
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await argon2.hash(signUpDto.password);

    const user = await this.userService.createUser({
      email: signUpDto.email,
      password: hashedPassword,
      firstName: signUpDto.firstName,
      lastName: signUpDto.lastName,
      phone: signUpDto.phone,
    });

    const { password, ...result } = user;
    return result;
  }
}
