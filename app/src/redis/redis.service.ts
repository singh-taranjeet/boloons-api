import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { REDIS_CLIENT, RedisClient } from './redis-client.type';
const expiryTime = 5 * 60;

@Injectable()
export class RedisService implements OnModuleDestroy {
  public constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
  ) {}

  onModuleDestroy() {
    this.redis.quit();
  }

  ping() {
    return this.redis.ping();
  }

  async createHash(key: string, payload: any) {
    await this.redis.hSet(key, payload);
    await this.redis.expire(key, expiryTime);
  }

  async updateHash(key: string, payload: any) {
    await this.redis.hSet(key, payload);
  }

  public redisClient() {
    return this.redis;
  }
}
