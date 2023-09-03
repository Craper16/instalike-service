export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_URI: string;
      PORT: string;
      SECRET: string;
      NODE_MAILER_GMAIL: string;
      NODE_MAILER_PASSWORD: string;
      AWS_S3_ID: string;
      AWS_S3_SECRET: string;
      AWS_S3_BUCKET_NAME: string;
    }
  }
}
