import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { LoginInput } from './input/login.input';
import type { Request } from 'express';
import { verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/core/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import { GqlContext } from 'src/shared/types/gql-context.types';

@Injectable()
export class SessionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {}

  public async login(input: LoginInput, session: GqlContext) {
    const { login, password } = input;

    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ username: { equals: login } }, { email: { equals: login } }],
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const sessionId = uuidv4();

    const sessionData = {
      userId: user.id,
      email: user.email,
      createdAt: new Date().toISOString(),
    };

    await this.redis.set(`session:${sessionId}`, JSON.stringify(sessionData));
    session.res.cookie('sessionId', sessionId);
    return user;
  }

  async logout(context: GqlContext) {
    return new Promise(async (resolve, reject) => {
      try {
        const sessionId = context.req.cookies['sessionId'];

        if (sessionId) {
          const redisKey = `session:${sessionId}`;
          await this.redis.del(redisKey);
        }

        context.req.session.destroy((err) => {
          if (err) {
            reject(false);
            return;
          }
          context.res.clearCookie('sessionId');

          resolve(true);
        });
      } catch (error) {
        reject(false);
      }
    });
  }
  async getCurrentUser(sessionId: string) {
    if (!sessionId) {
      return null;
    }

    const sessionData = await this.redis.get(`session:${sessionId}`);

    if (!sessionData) {
      return null;
    }

    const { userId } = JSON.parse(sessionData);

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }
    return user;
  }
}
