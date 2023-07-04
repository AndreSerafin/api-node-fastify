import { app } from './app'
import { env } from './env'

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
