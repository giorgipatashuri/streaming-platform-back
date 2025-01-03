import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateUserInput } from './input/create-user.input';
import { hash } from 'argon2';

import { ConfigService } from '@nestjs/config';
import { ChangeEmailInput } from './input/change-email.input';
import { User } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  public async findAll() {
    return this.prisma.user.findMany();
  }
  public async createUser(input: CreateUserInput) {
    const { email, password, username } = input;
    const isUserNameExists = await this.prisma.user.findUnique({
      where: { username },
    });
    if (isUserNameExists)
      throw new ConflictException('Username already taken!!');
    const isMailExists = await this.prisma.user.findUnique({
      where: { email },
    });
    if (isMailExists) throw new ConflictException('Email already taken!!');

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        displayName: username,
        password: await hash(password),
      },
    });
    return user;
  }
  public async changeEmail(user: User, input: ChangeEmailInput) {
    const { email } = input;

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email,
      },
    });

    return true;
  }
}
