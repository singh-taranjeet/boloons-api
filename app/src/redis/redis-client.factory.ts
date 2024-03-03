import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisClient, REDIS_CLIENT } from './redis-client.type';
// import { Secret } from '../utils/configuration';

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    // const secrets = new Secret();
    // await secrets.fetchSecret();
    const client = createClient({
      // password: 'pslGkjQlIPTVK5q8uOjTHkdzFq81nj5F',
      socket: {
        host: '0.0.0.0',
        port: 6379,
      },
    });
    await client.connect();
    client.on('error', function (error) {
      console.error('Error: Redis', error);
      // I report it onto a logging service like Sentry.
    });
    return client;
  },
};
