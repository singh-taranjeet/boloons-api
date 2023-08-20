import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisClient, REDIS_CLIENT } from './redis-client.type';

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    const client = createClient({
      password: 'fx49wwsglMMEeV6sM739imNuIv15rUVX',
      socket: {
        host: 'redis-11364.c212.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 11364,
      },
    });
    await client.connect();
    return client;
  },
};
