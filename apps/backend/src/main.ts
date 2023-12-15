import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getBotToken } from 'nestjs-telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const bot = app.get(getBotToken());
  app.use(bot.webhookCallback('/secret-path'));
  // bot.telegram.setWebhook('http://85.253.28.180/secret-path');

  // bot.startWebhook('/secret-path');
  await app.listen(80);
}
bootstrap();
