'use strict'
const __create = Object.create
const __defProp = Object.defineProperty
const __getOwnPropDesc = Object.getOwnPropertyDescriptor
const __getOwnPropNames = Object.getOwnPropertyNames
const __getProtoOf = Object.getPrototypeOf
const __hasOwnProp = Object.prototype.hasOwnProperty
const __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (const key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        })
  }
  return to
}
const __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod,
  )
)

// src/app.ts
const import_fastify = __toESM(require('fastify'))
const import_cookie = __toESM(require('@fastify/cookie'))

// src/routes/transactions.ts
const import_zod2 = require('zod')
const import_node_crypto = require('crypto')

// src/database.ts
const import_knex = require('knex')

// src/env/index.ts
const import_zod = require('zod')
const import_dotenv = require('dotenv')
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'test') {
  ;(0, import_dotenv.config)({ path: '.env.test' })
} else {
  ;(0, import_dotenv.config)()
}
const envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(['dev', 'test', 'prod']).default('prod'),
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z
    .string()
    .transform((v) => parseInt(v))
    .default('3333'),
})
const _env = envSchema.safeParse(process.env)
if (_env.success === false) {
  console.error(
    '\u26A0\uFE0F Invalid enviroment variables',
    _env.error.format(),
  )
  throw new Error('Invalid enviroment variables')
}
const env = _env.data

// src/database.ts
const config2 = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}
const knex = (0, import_knex.knex)(config2)

// src/middlewares/check-session-id-exists.ts
async function checkSessionIdExists(request, reply) {
  const sessionId = request.cookies.sessionId
  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unathourized',
    })
  }
}

// src/routes/transactions.ts
async function transactionsRoutes(app2) {
  app2.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()
      return { transactions }
    },
  )
  app2.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getTransactionsParamsSchema = import_zod2.z.object({
        id: import_zod2.z.string().uuid(),
      })
      const { id } = getTransactionsParamsSchema.parse(request.params)
      const { sessionId } = request.cookies
      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()
      return {
        transaction,
      }
    },
  )
  app2.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()
      return { summary }
    },
  )
  app2.post('/', async (request, reply) => {
    const createTransactionBodySchema = import_zod2.z.object({
      title: import_zod2.z.string(),
      amount: import_zod2.z.number(),
      type: import_zod2.z.enum(['credit', 'debit']),
    })
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )
    let sessionId = request.cookies.sessionId
    if (!sessionId) {
      sessionId = (0, import_node_crypto.randomUUID)()
      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1e3 * 60 * 60 * 24 * 7,
        // 7 days
      })
    }
    await knex('transactions').insert({
      id: (0, import_node_crypto.randomUUID)(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })
    return reply.status(201).send()
  })
}

// src/app.ts
const app = (0, import_fastify.default)()
app.register(import_cookie.default)
app.register(transactionsRoutes, {
  prefix: 'transactions',
})

// src/server.ts
const port = env.PORT
app
  .listen({
    port,
  })
  .then(() => {
    console.log(
      `http server running at - \x1B[32mhttp://localhost:${port}\x1B[0m`,
    )
  })
