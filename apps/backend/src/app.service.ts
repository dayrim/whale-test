import { Update, Ctx, Start, Command } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { TelegramUser } from './telegram-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Update()
export class AppUpdate {
  private readonly webUrl: string;
  constructor(
    @InjectRepository(TelegramUser)
    private readonly userRepository: Repository<TelegramUser>,
    private readonly configService: ConfigService, // Inject the ConfigService
  ) {
    this.webUrl = this.configService.get<string>('WEB_URL');
  }

  @Start()
  async start(@Ctx() ctx: Context) {
    const user = ctx.from;
    const telegramUser = this.userRepository.create(user);
    await this.userRepository.save(telegramUser);
    const message = `Welcome ${telegramUser.first_name}`;
    const websiteUrlWithUsername = `${this.webUrl}?username=${telegramUser.first_name}`;
    const urlButton = Markup.button.url('Visit Website', websiteUrlWithUsername);
    const inlineKeyboard = Markup.inlineKeyboard([urlButton]);

    await ctx.reply(message, inlineKeyboard);
  }
  @Command('adminhello')
  async adminHello(@Ctx() ctx: Context) {
    if ('text' in ctx.message) {
      const args = ctx.message.text.split(' ').slice(1);
      const telegramId = parseInt(args[0], 10);
      const text = args.slice(1).join(' ');

      const adminId = 761931477;
      if (ctx.from.id === adminId) {
        try {
          await ctx.telegram.sendMessage(telegramId, text);
        } catch (error) {
          await ctx.reply(`Failed to send message: ${error.message}`);
        }
      } else {
        await ctx.reply('You are not authorized to use this command.');
      }
    } else {
      await ctx.reply('This command requires a text message.');
    }
  }
}
