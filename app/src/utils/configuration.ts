import 'dotenv/config';
// import {
//   SecretsManagerClient,
//   GetSecretValueCommand,
// } from '@aws-sdk/client-secrets-manager';

// interface SecretType {
//   'mongo-db-url': string;
//   'redis-url': string;
//   'redis-password': string;
//   'redis-port': string;
// }

// const cacheSecret = memoSecret();

// function memoCallBack(callBack: () => Promise<SecretType>) {
//   let result;
//   let loading = false;
//   return async () => {
//     if (result) {
//       return result;
//     }
//     if (loading) {
//       function wait() {
//         if (loading) {
//           return new Promise((resolve) => {
//             setTimeout(() => {
//               resolve(wait());
//             }, 1000);
//           });
//         } else {
//           return result;
//         }
//       }
//       return await wait();
//     }
//     loading = true;
//     result = await callBack();
//     loading = false;

//     return result;
//   };
// }

// const fetchSecret = memoCallBack(async () => {
//   if (process.env.NODE_ENV === 'development') {
//     return {
//       'mongo-db-url': process.env.DB_URL,
//       'redis-url': process.env.REDIS_URL,
//       'redis-password': process.env.REDIS_PASSWORD,
//       'redis-port': process.env.REDIS_PORT,
//     };
//   }
//   const client = new SecretsManagerClient({
//     region: 'us-east-1',
//   });
//   const secretName = 'prod/boloons/config';
//   try {
//     console.log('Making request for secrets');
//     const response = await client.send(
//       new GetSecretValueCommand({
//         SecretId: secretName,
//         VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
//       }),
//     );

//     return JSON.parse(response.SecretString) as SecretType;
//   } catch (error) {
//     throw error;
//   }
// });

// function memoSecret() {
//   let cache: SecretType;

//   return async (n: keyof SecretType) => {
//     if (cache && cache[n]) {
//       return cache[n];
//     } else {
//       cache = await fetchSecret();
//       return cache[n];
//     }
//   };
// }

// export class Secret {
//   async getSecretValue(n: keyof SecretType) {
//     return cacheSecret(n);
//   }

// }


export default async () => {
  return {
    REDIS_URL: 'localhost',
    REDIS_PASSWORD: '',
    REDIS_PORT: '6379',
    DB_URL: 'localhost:27017',
  }
};
