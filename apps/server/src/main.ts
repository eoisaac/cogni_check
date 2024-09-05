import cors from '@fastify/cors'
import { predictImage } from '@repo/model'
import Fastify from 'fastify'

const fastify = Fastify({
  logger: false,
})

fastify.register(cors)

interface PredictBody {
  image: string
}

fastify.post('/predict', async (request, reply) => {
  try {
    const body = request.body as PredictBody

    if (!body.image)
      return reply.status(400).send({ error: 'No image provided' })

    const prediction = await predictImage(body.image)

    return { prediction }
  } catch (err) {
    fastify.log.error(err)
    return reply.status(500).send({ error: 'Internal Server Error' })
  }
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
