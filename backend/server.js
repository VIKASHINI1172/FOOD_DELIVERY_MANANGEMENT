import dns from 'node:dns'
dns.setServers(['8.8.8.8', '1.1.1.1'])


import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Food Delivery API is running!' })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1
      ? 'Connected'
      : 'Disconnected',
  })
})

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  items: [
    {
      id: Number,
      name: String,
      price: Number,
      quantity: Number,
      restaurantName: String,
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'Placed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Order =
  mongoose.models.Order || mongoose.model('Order', orderSchema)

app.post('/api/orders', async (req, res) => {
  try {
    const { items } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Your cart is empty.',
      })
    }

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )

    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      items,
      total,
    })

    res.status(201).json({
      message: 'Order saved successfully!',
      order,
    })
  } catch (error) {
    console.error('Order creation failed:', error.message)
    res.status(500).json({
      message: 'Could not save your order.',
    })
  }
})


app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error('Fetching orders failed:', error.message)
    res.status(500).json({
      message: 'Could not fetch orders.',
    })
  }
})


async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from backend/.env')
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected successfully!')

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Startup failed:', error.message)
    process.exit(1)
  }
}

startServer()
