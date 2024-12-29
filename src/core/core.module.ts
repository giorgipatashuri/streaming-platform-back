import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { getGraphQLConfig } from './config/graphql.config';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      useFactory: getGraphQLConfig,
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    RedisModule,
  ],
})
export class CoreModule {}
