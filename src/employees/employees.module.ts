import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants'


@Module({
  imports:[DatabaseModule,
    JwtModule.register({
      secret: jwtConstants.accessTokenSecret,  // Use secret from constants
      signOptions: { expiresIn: '60s' },  // JWT expiration time
    }),
    
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, JwtAuthGuard],
})
export class EmployeesModule {}