const { S3Client } = require('@aws-sdk/client-s3');

// Configure S3 client to point to local MinIO container
const s3Client = new S3Client({
  region: 'us-east-1', // Required by AWS SDK but can be anything for MinIO
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Crucial for MinIO to use path style URLs (e.g., http://localhost:9000/bucket-name)
});

module.exports = s3Client;
