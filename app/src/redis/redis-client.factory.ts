import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisClient, REDIS_CLIENT } from './redis-client.type';

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    console.log('Creating Redis Client', process.env.REDIS_URL);
    const client = createClient({
      socket: {
        host: '127.0.0.1',
        port: 6379,
      },
    });
    await client.connect();
    client.on('error', function (error) {
      console.error('Error: Redis', error);
    });
    return client;
  },
};
