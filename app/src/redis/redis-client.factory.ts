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
      password: 'pslGkjQlIPTVK5q8uOjTHkdzFq81nj5F',
      socket: {
        host: 'redis-10198.c291.ap-southeast-2-1.ec2.cloud.redislabs.com',
        port: 10198,
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
