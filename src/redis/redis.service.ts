import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { REDIS_CLIENT, RedisClient } from './redis-client.type';
import { GameFamily, GameStep, GameType } from 'src/utils/schemas/types';

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

  async createHash(params: {
    key: string;
    payload: { type: GameType; family: GameFamily; step: GameStep };
  }) {
    const { key, payload } = params;
    return this.redis.hSet(key, payload);
  }

  public redisClient() {
    return this.redis;
  }
}
