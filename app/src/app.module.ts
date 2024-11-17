import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { RedisModule } from './redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import config from './utils/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      ignoreEnvFile: true
    }),
    GameModule,
    RedisModule,
    MongooseModule.forRootAsync({
      useFactory: async () => {
        return {
          uri: 'mongodb://localhost:27017',
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [RedisModule],
})
export class AppModule { }
