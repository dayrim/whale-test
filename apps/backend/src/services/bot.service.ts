import { Update, Ctx, Start, Command } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { TelegramUser } from '../entities/telegram-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Update()
export class BotService {
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
    try {
      const user = ctx.from;
      const telegramUser = this.userRepository.create(user);
      await this.userRepository.save(telegramUser);

      const message = `Welcome ${telegramUser.first_name}`;
      const websiteUrlWithUsername = `${this.webUrl}?username=${telegramUser.first_name}`;
      const urlButton = Markup.button.url('Visit Website', websiteUrlWithUsername);

      const inlineKeyboard = Markup.inlineKeyboard([urlButton]);

      await ctx.reply(message, inlineKeyboard);
    } catch (error) {
      await ctx.reply('Sorry, an error occurred: ', error.message);
    }
  }
  @Command('adminhello')
  async adminHello(@Ctx() ctx: Context) {
    if ('text' in ctx.message) {
      const args = ctx.message.text.split(' ').slice(1);
      const telegramId = parseInt(args[0], 10);
      const text = args.slice(1).join(' ');

      // Retrieve the user from the database using the context's user ID
      const user = await this.userRepository.findOne({ where: { id: ctx.from.id } });

      // Check if the user is an admin
      if (user && user.is_admin) {
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
