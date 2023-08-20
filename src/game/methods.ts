import { RedisKeys } from 'src/utils/constants';

export function generateRedisGameSessionKey(gameId: string) {
  return `${RedisKeys.gameSession}:${gameId}`;
}

/**
 * SET: Generate key to store all the players of the game
 * @param gameId Id of the game
 * @returns redis key
 */
export function generateRedisKeyPlayersList(gameId: string) {
  return `${RedisKeys.gameSession}:${RedisKeys.players}:${gameId}`;
}

/**
 * HASH: Generate key to store all data of the player
 * @param playerId Id of player
 * @param gameId Id of game
 * @returns redis key
 */
export function generateRedisKeyPlayerData(playerId: string, gameId: string) {
  return `${RedisKeys.gameSession}:${gameId}:${RedisKeys.player}:${playerId}`;
}

/**
 * Hash: Generate Hash key to store all users with their userIds
 * @param id: Socket id
 * @returns players:socketid
 */
export function generateRedisKeyPlayerSocket(socketId: string) {
  return `${RedisKeys.players}:${socketId}`;
}

/**
 * Hash: Generate Hash key to store all users with their socketIds
 * @param id: Socket id
 * @returns players:socketid
 */
export function generateRedisKeySocketPlayer(playerId: string) {
  return `${RedisKeys.socket}:${playerId}`;
}
