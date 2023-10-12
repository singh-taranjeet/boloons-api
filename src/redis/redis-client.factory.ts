import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisClient, REDIS_CLIENT } from './redis-client.type';

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    const client = createClient({
      password: 'Xp8xLHa4i0nKpJBF3OrgPTz0xgNO2eEd',
      socket: {
        host: 'redis-13762.c264.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 13762,
      },
    });
    await client.connect();
    return client;
  },
};
