import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@eventrea/nestjs-common/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { betterAuth } from 'better-auth';
import { DatabaseModule } from '@eventrea/nestjs-common/database';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
@Module({
  imports: [
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
          basePath: '/api/auth',
          hooks: {},
        }),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
