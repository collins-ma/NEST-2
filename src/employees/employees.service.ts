import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';



@Injectable()
export class EmployeesService {

  constructor(private readonly databaseService:DatabaseService){}

  async create(createEmployeeDto:Prisma.EmployeeCreateInput) {

    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);

    return this.databaseService.employee.create({
      data: {
        username: createEmployeeDto.username,
       
        role: createEmployeeDto.role,
        password: hashedPassword,  // Store the hashed password
      },

      
      



      
    })
  }



 async findAll(role?:'Admin'|'Editor'|'Administrator'|'Manager') {
  if(role) {

   return this.databaseService.employee.findMany({
      where:{
        role,
      }
    })
  }
  return this.databaseService.employee.findMany()

  }

 async findOne(id: number) {
    return this.databaseService.employee.findUnique({
      where:{
        id,
      }
    })
  }

async  update(id: number, updateEmployeeDto: Prisma.EmployeeUpdateInput) {
    return this.databaseService.employee.update({
      where:{
        id
      },
      data:updateEmployeeDto

    })
  }

 async remove(id: number) {
    return this.databaseService.employee.delete({
      where:{
        id,
      }
    })
  }
}
