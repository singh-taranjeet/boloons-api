import 'dotenv/config';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

interface SecretType {
  'mongo-db-url': string;
  'redis-url': string;
  'redis-password': string;
}

export class Secret {
  private secretName = 'boloons-api';

  private client = new SecretsManagerClient({
    region: 'ap-southeast-2',
  });

  private secret: SecretType;

  getSecretValue(key: keyof SecretType) {
    return this.secret[key];
  }

  async fetchSecret() {
    try {
      const response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: this.secretName,
          VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
        }),
      );
      this.secret = JSON.parse(response.SecretString) as SecretType;
    } catch (error) {
      console.log('Error: Secrets Manager', error);
      throw error;
    }
  }
}

export default async () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      DB_URL: process.env.DB_URL,
      REDIS_URL: process.env.REDIS_URL,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    };
  }

  const secret = new Secret();
  await secret.fetchSecret();
  return {
    DB_URL: secret.getSecretValue('mongo-db-url'),
    REDIS_URL: secret.getSecretValue('redis-url'),
    REDIS_PASSWORD: secret.getSecretValue('redis-password'),
  };
};
