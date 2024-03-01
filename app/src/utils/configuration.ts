import 'dotenv/config';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

// interface SecretType {
//   'mongo-db-url': string;
//   'redis-url': string;
//   'redis-password': string;
//   'redis-port': string;
// }

// let secrets: SecretType;

// export class Secret {
//   constructor() {
//     if (secrets) {
//       console.log('Constructor: using cached secrets');
//     }
//   }
//   private secretName = 'boloons-api-secret';

//   private client = new SecretsManagerClient({
//     region: 'ap-southeast-2',
//   });

//   // private secret: SecretType;

//   getSecretValue(key: keyof SecretType) {
//     return secrets?.[key];
//   }

//   async fetchSecret() {
//     if (secrets) {
//       // console.log('using cached secrets');
//       //this.secret = secrets;
//       return;
//     }

//     try {
//       const response = await this.client.send(
//         new GetSecretValueCommand({
//           SecretId: this.secretName,
//           VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
//         }),
//       );
//       secrets = JSON.parse(response.SecretString) as SecretType;
//       //secrets = this.secret;
//       // console.log('Secrets fetched', secrets);
//     } catch (error) {
//       console.log('Error: Secrets Manager', error);
//       throw error;
//     }
//   }
// }

export default async () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      DB_URL: process.env.DB_URL,
      REDIS_URL: process.env.REDIS_URL,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      REDIS_PORT: process.env.REDIS_PORT,
    };
  }

  // const secret = new Secret();
  // await secret.fetchSecret();
  // return {
  //   DB_URL: secret.getSecretValue('mongo-db-url'),
  //   REDIS_URL: secret.getSecretValue('redis-url'),
  //   REDIS_PASSWORD: secret.getSecretValue('redis-password'),
  //   REDIS_PORT: secret.getSecretValue('redis-port'),
  // };
};
