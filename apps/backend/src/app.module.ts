import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppUpdate } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      useFactory: (configService: ConfigService) => {
        console.log(configService.get<string>('TELEGRAM_BOT_TOKEN'));
        return {
          token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
          launchOptions: {
            webhook: {
              domain: configService.get<string>('TELEGRAM_WEBHOOK_DOMAIN'),
              hookPath: '/secret-path',
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppUpdate],
})
export class AppModule {}
