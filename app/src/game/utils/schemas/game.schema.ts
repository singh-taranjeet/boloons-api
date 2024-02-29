import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GameFamily, GameStep, GameType } from '../types';

export type GameDocument = HydratedDocument<Game>;

@Schema()
export class Game {
  @Prop()
  step: GameStep;

  @Prop()
  type: GameType;

  @Prop()
  family: GameFamily;
}

export const GameSchema = SchemaFactory.createForClass(Game);
