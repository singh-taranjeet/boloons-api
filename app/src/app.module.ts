import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { RedisModule } from './redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import config, { Secret } from './utils/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    GameModule,
    RedisModule,
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const secrets = new Secret();
        const MONGO_URL = await secrets.getSecretValue('mongo-db-url');
        return {
          uri: MONGO_URL,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [RedisModule],
})
export class AppModule {}
