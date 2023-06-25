import fastify from 'fastify'

const app = fastify()

app.get('/hello', () => {
  return 'Hello Node'
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('http server running at - http://localhost:3333')
  })
