import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppUpdate } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramUser } from './telegram-user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env'],
    }),
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const webhookDomain = configService.get<string>('TELEGRAM_WEBHOOK_DOMAIN');
        const logger = new Logger('TelegrafConfig');
        logger.verbose(`Webhook domain is set to: ${webhookDomain}`);

        return {
          token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
          launchOptions: {
            webhook: {
              domain: webhookDomain,
              hookPath: '/secret-path',
            },
          },
        };
      },

      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('PostgresConfig');

        const host = configService.get<string>('POSTGRES_HOST');
        logger.verbose(`Postgres host is set to: ${host}`);

        const port = configService.get<number>('POSTGRES_PORT');
        logger.verbose(`Postgres port is set to: ${port}`);

        return {
          type: 'postgres',
          host,
          port,
          username: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_DB'),
          entities: [TelegramUser],
          synchronize: true, // Should be false in production
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([TelegramUser]),
  ],
  controllers: [AppController],
  providers: [AppUpdate],
})
export class AppModule {}
