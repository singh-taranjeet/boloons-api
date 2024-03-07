import 'dotenv/config';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

interface SecretType {
  'mongo-db-url': string;
  'redis-url': string;
  'redis-password': string;
  'redis-port': string;
}

export class Secret {
  constructor() {
    if (this.secrets) {
      console.log('Constructor: using cached secrets');
    }
  }
  private secretName = 'boloons-api-secret';

  private secrets: SecretType | undefined;

  private client = new SecretsManagerClient({
    region: 'us-east-1',
  });

  private cache: { [key: string]: string } = {};

  private async memoize(n: keyof SecretType) {
    if (this.cache[n]) {
      console.log('Fetching from cache...');
      return this.cache[n];
    } else {
      console.log('Not found in cache... fetching from AWS Secrets Manager');
      await this.fetchSecret();
      this.cache[n] = this.secrets?.[n];
      return this.cache[n];
    }
  }

  async getSecretValue(n: keyof SecretType) {
    return this.memoize(n);
  }

  async fetchSecret() {
    if (this.secrets) {
      console.log('using cached secrets');
      return;
    }

    try {
      const response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: this.secretName,
          VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
        }),
      );
      this.secrets = JSON.parse(response.SecretString) as SecretType;
    } catch (error) {
      throw error;
    }
  }
}

export default async () => {
  if (process.env.NODE_ENV === 'developmednt') {
    return {
      DB_URL: process.env.DB_URL,
      REDIS_URL: process.env.REDIS_URL,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      REDIS_PORT: process.env.REDIS_PORT,
    };
  }

  const secret = new Secret();
  await secret.fetchSecret();

  //const memo = await secret.getSecretValue();
  const DB_URL = await secret.getSecretValue('mongo-db-url');
  const REDIS_URL = await secret.getSecretValue('redis-url');
  const REDIS_PASSWORD = await secret.getSecretValue('redis-password');
  const REDIS_PORT = await secret.getSecretValue('redis-port');

  return {
    DB_URL,
    REDIS_URL,
    REDIS_PASSWORD,
    REDIS_PORT,
  };
};
