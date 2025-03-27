import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
  DATABASE_MONGO_URL: string;
  JWT_SECRET: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string().required()),
    DATABASE_MONGO_URL: joi.string().required(),
    JWT_SECRET: joi.string().required(),
  })
  .unknown(true);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { error, value } = envSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
  DATABASE_MONGO_URL: process.env.DATABASE_MONGO_URL,
  JWT_SECRET: process.env.JWT_SECRET,
});

if (error) {
  throw new Error(`Config validation error : ${error.message}`);
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const envVars: EnvVars = value;

export const envs = {
  PORT: envVars.PORT,
  NATS_SERVERS: envVars.NATS_SERVERS,
  DATABASE_MONGO_URL: envVars.DATABASE_MONGO_URL,
  JWT_SECRET: envVars.JWT_SECRET,
};
