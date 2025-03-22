import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.register.user' })
  create() {
    return 'auth.register.user2';
    //return this.authService.create(createAuthDto);
  }

  @MessagePattern({ cmd: 'auth.login.user' })
  findAll() {
    return 'auth.login.user';
    //return this.authService.findAll();
  }

  @MessagePattern({ cmd: 'auth.verify.user' })
  findOne() {
    return 'auth.verify.user';
    //return this.authService.findOne(id);
  }
}
