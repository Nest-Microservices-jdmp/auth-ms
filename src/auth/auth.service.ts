/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, RegisterUserDto } from './dto';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadOwn } from './interfaces';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {
    super();
  }

  signJWT(payload: JwtPayloadOwn) {
    return this.jwtService.sign(payload);
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('MongoDb Connected');
  }

  async create({ email, name, password }: RegisterUserDto) {
    await this.findUser(email);

    try {
      const user = await this.user.create({
        data: { name, email, password: bcrypt.hashSync(password, 10) },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: __, ...rest } = user;

      return {
        rest,
        token: this.signJWT(rest),
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Unique constraint failed')
      ) {
        this.logger.error(`User with email ${email} already exists`);
        throw new RpcException({
          message: 'A user with this email already exists',
          status: HttpStatus.BAD_REQUEST,
        });
      }

      throw new RpcException({
        message: 'An error occurred while creating the user',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async login({ email, password }: LoginUserDto) {
    const user = await this.findUser(email, 'login');

    const isPasswordValid = bcrypt.compareSync(password, user!.password);
    if (!isPasswordValid) {
      this.logger.error('Invalid credentials');
      throw new RpcException({
        message: 'Invalid credentials2',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    const userCopy: Partial<typeof user> = { ...user };
    delete userCopy.password;
    return {
      user: userCopy,
      token: this.signJWT({
        id: userCopy.id!,
        email: userCopy.email!,
        name: userCopy.name!,
      }),
    };
  }

  async findUser(email: string, type: 'register' | 'login' = 'register') {
    const user = await this.user.findUnique({
      where: { email },
    });
    if (user && type == 'register') {
      this.logger.error(`User with email ${email} already exists`);
      throw new RpcException({
        message: `This user already exists`,
        status: HttpStatus.BAD_REQUEST,
      });
    }
    if (!user && type == 'login') {
      this.logger.error(`User with email ${email} already exists`);
      throw new RpcException({
        message: 'Invalid credentials',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return user;
  }

  verifyToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.JWT_SECRET,
      });
      return {
        user,
        token: this.signJWT(user),
      };
    } catch {
      this.logger.error('Invalid token');
      throw new RpcException({
        message: 'Invalid token',
        status: HttpStatus.UNAUTHORIZED,
      });
    }
  }
}
