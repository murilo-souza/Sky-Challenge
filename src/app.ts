import fastify from 'fastify'
import { moviesRoutes } from './routes/movies'

export const app = fastify()

app.register(moviesRoutes, {
  prefix: 'filmes',
})
