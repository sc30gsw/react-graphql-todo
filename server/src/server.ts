import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import mongoose from 'mongoose'
import { loadSchemaSync } from '@graphql-tools/load'
import { join } from 'path'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { addResolversToSchema } from '@graphql-tools/schema'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import resolvers from './resolvers/Resolver'
import getUserId from './util/tokenPayload'

const app = express()
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

const PORT = process.env.PORT as string
const url = process.env.DATABASE_URL as string

// DB接続
try {
  mongoose.set('strictQuery', true)
  mongoose.connect(url)
  console.log('DB接続中')
} catch (err) {
  console.log(err)
}

const schema = loadSchemaSync(join(__dirname, './schema.graphql'), {
  loaders: [new GraphQLFileLoader()],
})

const schemaWithResolvers = addResolversToSchema({ schema, resolvers })
const server = new ApolloServer({
  schema: schemaWithResolvers,
})

const startServer = async () => {
  try {
    const { url } = await startStandaloneServer(server, {
      context: async ({ req }) => ({
        ...req,
        prisma,
        userId: req && req.headers.authorization ? getUserId(req) : null,
      }),
      listen: { port: 4000 },
    })

    console.log(`Server is running on ${url}`)
  } catch (err) {
    console.log(err)
  }
}

startServer()
