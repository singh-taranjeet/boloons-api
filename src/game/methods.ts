import { GameConstants } from 'src/utils/constants';

export function generateRedisGameSessionKey(gameId: string) {
  return `${GameConstants.gameKeys.gameSession}:${gameId}`;
}
