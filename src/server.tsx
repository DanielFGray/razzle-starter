import express, {
  urlencoded as urldata,
  json as jsonbody,
  static as staticFiles,
} from 'express'
import morgan from 'morgan'
import { apolloServer } from './apolloServer'
import { SSR } from './render'

const RAZZLE_PUBLIC_DIR = process.env.RAZZLE_PUBLIC_DIR
if (! RAZZLE_PUBLIC_DIR)
  throw new ReferenceError('undefined env var RAZZLE_PUBLIC_DIR')

const app = express()
app.disable('x-powered-by')
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

if (process.env.NODE_ENV !== 'production') {
  app.use((_req, res, next) => {
    res.set(
      'Access-Control-Allow-Origin',
      `${process.env.HOST}:${Number(process.env.PORT) + 1}`,
    )
    next()
  })
}

app.use(jsonbody({ strict: true }))
app.use(urldata({ extended: false }))
// sessions?
app.use(staticFiles(RAZZLE_PUBLIC_DIR))
app.use(apolloServer.getMiddleware())
app.get('/*', SSR)

export default app
