import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
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
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findUser({ email });
    if (user && (await argon2.verify(user.password, pass))) {
      const { password, ...result } = user;

      return result;
    }
    return null;
  }

  async getTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
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

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateUser({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async login(user: User) {
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return { message: 'Login successful', ...tokens };
  }

  async logout(userId: string) {
    await this.userService.updateUser({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findUser({ id: userId });
    if (!user || !user.refreshToken) {
      return null;
    }
    const refreshTokenMatches = await argon2.verify(user.refreshToken, refreshToken);
    if (refreshTokenMatches) {
      return user;
    }
    return null;
  }

  async refreshTokens(userId: string, email: string, role: string) {
    const tokens = await this.getTokens(userId, email, role);
    await this.updateRefreshToken(userId, tokens.refresh_token);
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
