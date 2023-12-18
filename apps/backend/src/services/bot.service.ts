import { Update, Ctx, Start, Command } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { TelegramUser } from '../entities/telegram-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';
import input from 'input'; // npm i input

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

  @Command('getuserid')
  async getUserId(@Ctx() ctx: Context) {
    const user = await this.userRepository.findOne({ where: { id: ctx.from.id } });
    // Check if the user is an admin
    if (!user || !user.is_admin) {
      await ctx.reply('You are not authorized to use this command.');
      return;
    }
    if ('text' in ctx.message) {
      const args = ctx.message.text.split(' ').slice(1);
      const username = args[0]; // Assuming this is the Telegram username
      console.log('Username to find:', username);

      // Ensure that username is provided
      if (!username) {
        await ctx.reply('Please provide a username.');
        return;
      }

      const stringSession = ''; // Your saved session string
      const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
      const appId = this.configService.get<number>('TELEGRAM_APP_ID');
      const appIdHash = this.configService.get<string>('TELEGRAM_APP_ID_HASH');
      (async () => {
        try {
          const client = new TelegramClient(new StringSession(stringSession), Number(appId), appIdHash, {
            connectionRetries: 5,
          });
          await client.start({
            botAuthToken: botToken,
          });
          console.log('Session:', client.session.save());
          const userEntity = await client.getInputEntity(username);
          if ('userId' in userEntity) {
            await ctx.reply('User ID: ' + userEntity.userId);
          }
        } catch (error) {
          console.error('Error retrieving user information:', error);
          await ctx.reply('Error retrieving user information:' + error.message);
        }
      })();
    } else {
      await ctx.reply('This command requires a text message.');
    }
  }
}
