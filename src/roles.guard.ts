import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLES_KEY } from './roles.decorators'; // You need a custom decorator to mark the roles for routes
  import { Request } from 'express';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      // Get the required roles for the route
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (!requiredRoles) {
        return false; // If no roles are required, allow access
      }
  
      // Get the user object from the request, which was populated by the AuthGuard
      const request = context.switchToHttp().getRequest();
      const user = request['user'];
  
      // Check if user roles match the required roles for the route
      if (!user || !user.role) {
        throw new UnauthorizedException('User role is missing');
      }
  
      const hasRole = requiredRoles.some(role => user.role.includes(role));
  
      if (!hasRole) {
        throw new ForbiddenException('Insufficient permissions');
      }
  
      return true;
    }
  }
  