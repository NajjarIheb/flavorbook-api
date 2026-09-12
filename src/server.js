import 'dotenv/config'
import createApp from './app.js'
import './config/db.js'

const PORT = process.env.PORT || 5001
const app = createApp()

app.listen(PORT, () => {
  console.log(`Recipe API running on http://localhost:${PORT}`)
  console.log(`Swagger docs on http://localhost:${PORT}/api-docs`)
})