import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import mongoose from 'mongoose'

const app = express()
app.use(cors({ origin: 'http://localhost:3000' }))
const PORT = process.env.PORT || ''
const url = process.env.DATABASE_URL || ''

// DB接続
try {
  mongoose.set('strictQuery', true)
  mongoose.connect(url)
  console.log('DB接続中')
} catch (err) {
  console.log(err)
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
