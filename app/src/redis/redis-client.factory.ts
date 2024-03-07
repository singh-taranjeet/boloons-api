import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisClient, REDIS_CLIENT } from './redis-client.type';
import { Secret } from '../utils/configuration';

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    const sercret = new Secret();
    await sercret.fetchSecret();
    const REDIS_URL = await sercret.getSecretValue('redis-url');
    const REDIS_PORT = await sercret.getSecretValue('redis-port');
    const client = createClient({
      socket: {
        host: REDIS_URL,
        port: REDIS_PORT ? parseInt(REDIS_PORT) : 6379,
      },
    });
    await client.connect();
    client.on('error', function (error) {
      console.error('Error: Redis', error);
    });
    return client;
  },
};
