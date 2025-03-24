import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.register.user' })
  create(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.create(registerUserDto);
  }

  @MessagePattern({ cmd: 'auth.login.user' })
  login(@Payload() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @MessagePattern({ cmd: 'auth.verify.user' })
  verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }
}
