import { Test, TestingModule } from '@nestjs/testing';
import { TextChannelController } from './text-channel.controller';
import { ConfigService } from '@nestjs/config';
import { TextChannelService } from './text-channel.service';

describe('TextChannelController', () => {
  let controller: TextChannelController;
  const mockService = {
    sendMessage: jest.fn(),
    deleteMessage: jest.fn(),
  };
  const mockConfig = {
    get: jest.fn().mockReturnValue('test-secret'), // .env 변수 같은 거
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextChannelController],
      providers: [
        { provide: TextChannelService, useValue: mockService },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    controller = module.get<TextChannelController>(TextChannelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
