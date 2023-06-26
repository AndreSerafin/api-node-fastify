import fastify from 'fastify'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'

const app = fastify()
app.register(transactionsRoutes, {
  prefix: 'transactions',
})

const port = env.PORT

app
  .listen({
    port,
  })
  .then(() => {
    console.log(
      `http server running at - \u001b[32mhttp://localhost:${port}\u001b[0m`,
    )
  })
