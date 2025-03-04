import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Ip, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Prisma } from '@prisma/client';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/roles.decorators';
import { RolesGuard } from 'src/roles.guard';


// @SkipThrottle() skips rate limiting for all routes

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  private readonly logger= new MyLoggerService(EmployeesController.name)

  @Post()
  create(@Body() createEmployeeDto: Prisma.EmployeeCreateInput) {
    return this.employeesService.create(createEmployeeDto);
  }

  // @SkipThrottle({default:false}) apply rate limit to this handler

  @Get()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll( @Ip() ip:string, @Query('role') role?:'Admin'|'Editor'|'Manager'|'Administrator') {
    this.logger.log(`Request for all employees \ ${ip}`)
    return this.employeesService.findAll(role);
  }

  @Throttle({short:{ttl:1000, limit:1}})

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeDto: Prisma.EmployeeUpdateInput) {
    return this.employeesService.update(+id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(+id);
  }
}
