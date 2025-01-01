import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from 'src/core/prisma/prisma.service';

export class GqlAuthGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    if (typeof request.session.userId == 'undefined') {
      throw new UnauthorizedException('user dont authorized');
    }
    const user = this.prismaService.user.findFirst({
      where: { id: request.session.userId },
    });
    request.user = user;
    return true;
  }
}
