import { ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export function getGraphQLConfig(
  configService: ConfigService,
): ApolloDriverConfig {
  return {
    playground: true,
    path: configService.getOrThrow<string>('GRAPHQL_PREFIX'),
    autoSchemaFile: join(process.cwd() + 'src/core/graphql/schema.gql'),
    sortSchema: true,
    context: ({ req, res }) => ({ req, res }),
  };
}