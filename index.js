import connectToMongo from "./db.js"
connectToMongo()
import express from "express"
import routes from "./routes/apis.js"
import cors from "cors"
const app = express()
app.use(express.json())
app.use(cors())
app.use('/api/auth', routes)

app.listen(8001, () => {
    console.log('App listing at http://localhost:8001')
})

