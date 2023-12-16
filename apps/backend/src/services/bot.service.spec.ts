import { Test, TestingModule } from '@nestjs/testing';
import { BotService } from './bot.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TelegramUser } from '../entities/telegram-user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Context, Markup } from 'telegraf';

describe('BotService', () => {
  let botService: BotService;
  let mockRepository: Partial<Repository<TelegramUser>>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation(async (user) => Promise.resolve(user)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotService,
        {
          provide: getRepositoryToken(TelegramUser),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://example.com') },
        },
      ],
    }).compile();

    botService = module.get<BotService>(BotService);
  });

  it('should be defined', () => {
    expect(botService).toBeDefined();
  });

  describe('start method', () => {
    it('should save a new user and send a welcome message', async () => {
      const mockCtx = {
        from: { id: 123, first_name: 'John', is_bot: false },
        reply: jest.fn(),
      } as unknown as Context;

      await botService.start(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx.from);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockCtx.reply).toHaveBeenCalledWith(
        'Welcome John',
        Markup.inlineKeyboard([Markup.button.url('Visit Website', 'http://example.com?username=John')]),
      );
    });

    it('should handle errors', async () => {
      const mockCtx = {
        from: { id: 123, first_name: 'John', is_bot: false },
        reply: jest.fn(),
      } as unknown as Context;

      (mockRepository.save as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

      await botService.start(mockCtx);

      expect(mockCtx.reply).toHaveBeenCalledWith('Sorry, an error occurred: ', 'Test error');
    });
  });
});
