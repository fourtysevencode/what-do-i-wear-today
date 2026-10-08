import "server-only";

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Backblaze B2 through its S3-compatible API. The bucket is private: objects are
// only reachable through short-lived signed URLs. This is the one file that knows
// about the storage provider.

let client: S3Client | null = null;

function config() {
  const endpoint = process.env.B2_ENDPOINT;
  const bucket = process.env.B2_BUCKET;
  const accessKeyId = process.env.B2_KEY_ID;
  const secretAccessKey = process.env.BLAZE_B2_APP_KEY;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("B2_ENDPOINT, B2_BUCKET, B2_KEY_ID and BLAZE_B2_APP_KEY must be set");
  }
  // https://s3.eu-central-003.backblazeb2.com -> eu-central-003
  const region = new URL(endpoint).hostname.split(".")[1];
  return { endpoint, bucket, region, accessKeyId, secretAccessKey };
}

function s3() {
  if (!client) {
    const { endpoint, region, accessKeyId, secretAccessKey } = config();
    client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      // B2 doesn't accept the newer default checksum headers on every request.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return client;
}

export async function putPng(key: string, body: Uint8Array) {
  await s3().send(
    new PutObjectCommand({
      Bucket: config().bucket,
      Key: key,
      Body: body,
      ContentType: "image/png",
      // Keys are unique per garment, so the bytes never change.
      CacheControl: "private, max-age=31536000, immutable",
    }),
  );
}

/** A URL that can read one object for `expiresIn` seconds. */
export async function signedGetUrl(key: string, expiresIn = 300) {
  return getSignedUrl(s3(), new GetObjectCommand({ Bucket: config().bucket, Key: key }), { expiresIn });
}

export async function deleteObject(key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: config().bucket, Key: key }));
}
