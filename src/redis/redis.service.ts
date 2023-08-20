import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { REDIS_CLIENT, RedisClient } from './redis-client.type';
import { GameFamily, GameStep, GameType } from 'src/utils/schemas/types';
import {
  generateRedisGameSessionKey,
  generateRedisKeyPlayerData,
  generateRedisKeyPlayersList,
  generateRedisKeySocketPlayer,
} from 'src/game/methods';

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

  public redisClient() {
    return this.redis;
  }
}
