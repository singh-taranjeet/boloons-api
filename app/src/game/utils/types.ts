import { Events, GameConstants } from './constants';

export interface PlayerType {
  id: string;
  score: number;
  name: string;
}

export type GameStep = keyof typeof GameConstants.step;
export type GameType = keyof typeof GameConstants.type;
export type GameFamily = keyof typeof GameConstants.family;

export type GameEventMessageType = keyof typeof Events.game.eventMessageType;
