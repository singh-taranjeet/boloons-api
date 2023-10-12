import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    GameModule,
    MongooseModule.forRoot(
      'mongodb+srv://taranjeet:taranjeet@taranjeetsinghcluster.cwae524.mongodb.net/?retryWrites=true&w=majority',
    ),
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [RedisModule],
})
export class AppModule {}
