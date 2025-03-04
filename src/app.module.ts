import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { EmployeesModule } from './employees/employees.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MyLoggerModule } from './my-logger/my-logger.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';


@Module({
  imports: [DatabaseModule
    , EmployeesModule,
    JwtModule.register({
      secret: jwtConstants.accessTokenSecret,  // Use secret from constants
      signOptions: { expiresIn: '60s' },  // JWT expiration time
    }),
    ThrottlerModule.forRoot([{
      name:"short",
      ttl:10000,
      limit:3

    },
    {
      ttl:60000,
      limit:100

    },
  ]),
    MyLoggerModule,
    AuthModule
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, {
    provide:APP_GUARD,
    useClass:ThrottlerGuard
  }, AuthService],
})
export class AppModule {}
