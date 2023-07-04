import { z } from 'zod'
import { config } from 'dotenv'

console.log(process.env.NODE_ENV)

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']).default('prod'),
  DATABASE_URL: z.string(),
  PORT: z
    .string()
    .transform((v) => parseInt(v))
    .default('3333'),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('⚠️ Invalid enviroment variables', _env.error.format())

  throw new Error('Invalid enviroment variables')
}

export const env = _env.data
