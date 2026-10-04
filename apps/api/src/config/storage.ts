import * as Minio from 'minio';
import { env } from './env';
import { logger } from './logger';

let minioClient: Minio.Client | null = null;

export function getMinioClient(): Minio.Client {
  if (!minioClient) {
    minioClient = new Minio.Client({
      endPoint: new URL(env.STORAGE.ENDPOINT).hostname,
      port: parseInt(new URL(env.STORAGE.ENDPOINT).port || '9000', 10),
      useSSL: env.STORAGE.ENDPOINT.startsWith('https'),
      accessKey: env.STORAGE.ACCESS_KEY,
      secretKey: env.STORAGE.SECRET_KEY,
    });
  }
  return minioClient;
}

export async function initStorage(): Promise<void> {
  try {
    const client = getMinioClient();
    const exists = await client.bucketExists(env.STORAGE.BUCKET);
    if (!exists) {
      await client.makeBucket(env.STORAGE.BUCKET, env.STORAGE.REGION);
      // Set public read policy
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${env.STORAGE.BUCKET}/*`],
          },
        ],
      };
      await client.setBucketPolicy(env.STORAGE.BUCKET, JSON.stringify(policy));
      logger.info(`Bucket "${env.STORAGE.BUCKET}" created with public read policy`);
    } else {
      logger.info(`Storage bucket "${env.STORAGE.BUCKET}" ready`);
    }
  } catch (error) {
    logger.warn('Storage initialization failed (non-critical):', error);
  }
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<UploadResult> {
  const client = getMinioClient();
  await client.putObject(env.STORAGE.BUCKET, key, buffer, buffer.length, {
    'Content-Type': contentType,
  });
  return {
    key,
    url: `${env.STORAGE.PUBLIC_URL}/${env.STORAGE.BUCKET}/${key}`,
    size: buffer.length,
    contentType,
  };
}

export async function deleteFile(key: string): Promise<void> {
  const client = getMinioClient();
  await client.removeObject(env.STORAGE.BUCKET, key);
}

export async function getPresignedUrl(key: string, expirySeconds: number = 3600): Promise<string> {
  const client = getMinioClient();
  return client.presignedGetObject(env.STORAGE.BUCKET, key, expirySeconds);
}
