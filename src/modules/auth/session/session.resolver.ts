import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SessionService } from './session.service';
import { UserModel } from '../account/model/user.model';
import { GqlContext } from 'src/shared/types/gql-context.types';
import { LoginInput } from './input/login.input';

@Resolver('Session')
export class SessionResolver {
  constructor(private readonly sessionService: SessionService) {}

  @Mutation(() => UserModel, { name: 'Login' })
  public async login(
    @Args('data') input: LoginInput,
    @Context() context: GqlContext,
  ) {
    return this.sessionService.login(input, context);
  }

  @Mutation(() => String, { name: 'Logout' })
  public async logout(@Context() context: GqlContext) {
    return this.sessionService.logout(context);
  }
  @Query(() => UserModel, { name: 'Me' })
  async me(@Context() context: { req: any }) {
    const sessionId = context.req.cookies['sessionId'];
    if (!sessionId) return null;
    return this.sessionService.getCurrentUser(sessionId);
  }
}
