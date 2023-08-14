import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PlayerType } from './types';

export type GameDocument = HydratedDocument<Game>;

@Schema()
export class Game {
  @Prop()
  inProgress: boolean;

  @Prop()
  players: [PlayerType];
}

export const GameSchema = SchemaFactory.createForClass(Game);
