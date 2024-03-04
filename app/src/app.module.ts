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
    GameModule,
    RedisModule,
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    MongooseModule.forRoot(
      'mongodb+srv://taranjeet:taranjeet@taranjeetsinghcluster.cwae524.mongodb.net/?retryWrites=true&w=majority',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [RedisModule],
})
export class AppModule {}