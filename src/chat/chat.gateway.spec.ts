import { Test } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { TextChannelService } from './text-channel/text-channel.service';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

describe('ChatGateway', () => {
  let gateway: ChatGateway;

  const mockService = {
    sendMessage: jest.fn(),
    deleteMessage: jest.fn(),
  };

  const mockSocket = {
    data: { userId: 1 },
    id: 'socket123',
    join: jest.fn(),
    emit: jest.fn(),
  } as unknown as Socket;
  const mockConfig = {
    get: jest.fn().mockReturnValue('test-secret'), // .env 변수 같은 거
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: TextChannelService, useValue: mockService },
        { provide: ConfigService, useValue: mockConfig }, // 👈 추가!
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);

    // mock WebSocketServer (server.emit)
    gateway['server'] = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as any;
  });

  it('should send a message', async () => {
    const mockMessage = {
      id: 1,
      content: 'Hello',
      channelId: 1,
      userId: 1,
    };
    mockService.sendMessage.mockResolvedValue(mockMessage);

    await gateway.handleSendMessage(
      { content: 'Hello', channelId: 1 },
      mockSocket,
    );

    expect(mockService.sendMessage).toHaveBeenCalledWith({
      content: 'Hello',
      channelId: 1,
      userId: 1,
    });
    expect(gateway['server'].to).toHaveBeenCalledWith('channel-1');
    expect(gateway['server'].to('channel-1').emit).toHaveBeenCalledWith(
      'newMessage',
      mockMessage,
    );
  });

  it('should delete a message', async () => {
    mockService.deleteMessage.mockResolvedValue({ id: 99, textChannelId: 2 });

    await gateway.handleDeleteMessage(99, mockSocket);

    expect(mockService.deleteMessage).toHaveBeenCalledWith(99, 1);
    expect(gateway['server'].to).toHaveBeenCalledWith('channel-2');
    expect(gateway['server'].to('channel-2').emit).toHaveBeenCalledWith(
      'messageDeleted',
      {
        messageId: 99,
      },
    );
  });
});
