import express, { static as staticFiles } from 'express'
import morgan from 'morgan'
import { SSR } from './render'

const RAZZLE_PUBLIC_DIR = process.env.RAZZLE_PUBLIC_DIR
if (! RAZZLE_PUBLIC_DIR) throw new ReferenceError('undefined env var RAZZLE_PUBLIC_DIR')

const app = express()
app.disable('x-powered-by')
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(staticFiles(RAZZLE_PUBLIC_DIR))
app.get('/*', SSR)

export default app
