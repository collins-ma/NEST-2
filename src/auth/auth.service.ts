import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from 'src/database/database.service'; // Prisma service to interact with the DB
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { Response } from 'express';


@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService
  ) {}

 

  // Login
  
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.databaseService.employee.findUnique({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid username or password');
  }

  async login(user: any, response: Response) {
    try {
      const payload = {  sub: user.id, role: user.role, username:user.username };
      
      const refreshToken = this.jwtService.sign(payload, {
        secret: jwtConstants.refreshTokenSecret,
        expiresIn: '2m',
      });

     


      
      response.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure:false,
        maxAge: 2 * 60 * 1000, 
      });
      
    
  
    
      const accessToken = this.jwtService.sign(payload, {
        secret: jwtConstants.accessTokenSecret,
        expiresIn: '60s',
      });

    return response.json({accessToken})
    }
  
  
      
      
    
     catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }}