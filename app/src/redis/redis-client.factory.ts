import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisClient, REDIS_CLIENT } from './redis-client.type';
import { Secret } from '../utils/configuration';

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    const secrets = new Secret();
    await secrets.fetchSecret();
    const client = createClient({
      password: secrets.getSecretValue('redis-password'),
      socket: {
        host: secrets.getSecretValue('redis-url'),
        port: 10198,
      },
    });
    await client.connect();
    return client;
  },
};
