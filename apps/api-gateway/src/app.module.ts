import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@eventrea/nestjs-common/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { betterAuth } from 'better-auth';
import { DatabaseModule } from '@eventrea/nestjs-common/database';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60 * 1000,
          limit: 10,
        },
      ],
    }),
    EventsModule,
    ConfigModule,
    AuthModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [getConnectionToken()],
      useFactory: (connection: Connection) => ({
        auth: betterAuth({
          database: mongodbAdapter(connection.getClient().db()),
          emailAndPassword: {
            enabled: true,
          },
          trustedOrigins: ['http://localhost:3001'],
          basePath: '/api/auth',
          hooks: {},

          advanced: {
            cookies: {
              sessionToken: {
                name: 'better-auth.session',
                options: {
                  httpOnly: true,
                  secure: true, // 🔥 REQUIRED in prod
                  sameSite: 'none', // 🔥 REQUIRED cross-site
                  // domain: '.dsarr.fun', // 🔥 REQUIRED for subdomains
                  path: '/',
                },
              },
            },
            defaultCookieAttributes: {
              secure: true,
              httpOnly: true,
              sameSite: 'none',
              partitioned: true,
            },
          },
        }),
      }),
    }),
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
