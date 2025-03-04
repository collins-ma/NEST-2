import { Controller, Post, Body, HttpCode,Res, Req, Get} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response , Request} from 'express';
import { UnauthorizedException ,ForbiddenException, InternalServerErrorException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly jwtService: JwtService,) {}

  @Post('login')
  @HttpCode(200) 
  async login(@Body() body: { username: string; password: string },@Res() response: Response) {
    console.log('Login attempt for:', body.username, body.password);
    try{
    const user = await this.authService.validateUser(body.username, body.password);
    console.log('User validated:', user);
    return this.authService.login(user,response);
    }
    catch(error){
      console.error('Login error:', error);
    }
  }
  @Get('refresh')
  @HttpCode(200)
  async refresh(@Req() request: Request, @Res() response: Response) {
    const cookies = request.cookies;
  
    const refreshToken = cookies?.jwt;

    console.log(JSON.stringify(refreshToken))


    
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token is missing');
    }

    const decodedToken = this.jwtService.decode(refreshToken) as any;

    if (decodedToken?.exp) {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const expirationTime = decodedToken.exp; // Expiration time in seconds
      const remainingTime = expirationTime - currentTime; // Remaining time in seconds

      console.log(`Refresh token expiration time: ${expirationTime} seconds`);
      console.log(`Remaining time until expiration: ${remainingTime} seconds`);

      // Optionally, you can return the remaining time as part of the response
      if (remainingTime <= 0) {
        throw new ForbiddenException('Refresh token has expired');
      }
    } else {
      console.log('Unable to retrieve expiration time from the refresh token.');
    }

    
  
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: jwtConstants.refreshTokenSecret,
        
      });
      console.log('Payload After Verification:', payload);
    
  
      // Generate a new access token using the payload
      const accessToken = this.jwtService.sign(
        {
          
          sub: payload.sub,
          role: payload.role,
          username: payload.username,
        },
        {
          secret: jwtConstants.accessTokenSecret,
          expiresIn: '60s',
        },
      );
  
      // Return the new access token
      return response.json({ accessToken });
    } catch (err) {
      // Check if the error is due to expiration or malformed token
      if (err.name === 'TokenExpiredError') {
        throw new ForbiddenException('Refresh token has expired');
      } else if (err.name === 'JsonWebTokenError') {
        throw new ForbiddenException('Refresh token is invalid');
      } else {
        // Generic error handling
        throw new ForbiddenException('Unable to verify refresh token');
      }
    }
  }
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() request: Request, @Res() response: Response) {
    const cookies = request.cookies;
    const refreshToken = cookies?.jwt;
  
    try {
      // Check if the refresh token exists
      if (!refreshToken) {
        throw new UnauthorizedException('No token found; user already logged out');
      }
  
      // Clear the refresh token cookie
      response.clearCookie('jwt', {
        httpOnly: true,
        secure: false, // Set to true if you're using HTTPS
        sameSite: 'lax', // Adjust based on your frontend setup
      });
  
      return response.json({ message: 'Logout successful' });
    } catch (error) {
      console.log(error)
      // Use NestJS's exception handling
      throw new InternalServerErrorException(
        'An error occurred during logout. Please try again later.'
      );
    }
  }
  

}