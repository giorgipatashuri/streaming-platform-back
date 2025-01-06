import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { getMailerConfig } from 'src/core/config/mailer.config';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMailerConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
})
export class MailModule {}
