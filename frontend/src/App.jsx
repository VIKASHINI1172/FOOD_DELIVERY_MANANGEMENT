
import { useEffect, useState } from 'react'
import './App.css'

const restaurants = [
  {
    id: 1,
    name: 'Spice Garden',
    cuisine: 'South Indian • North Indian',
    rating: 4.7,
    time: '20–30 min',
    emoji: '🍛',
    color: '#fff0dc',
    foods: [
      { id: 101, name: 'Masala Dosa', price: 90, emoji: '🥞' },
      { id: 102, name: 'Paneer Butter Masala', price: 180, emoji: '🍛' },
      { id: 103, name: 'Veg Biryani', price: 150, emoji: '🍚' },
    ],
  },
  {
    id: 2,
    name: 'Burger House',
    cuisine: 'Burgers • Fast Food',
    rating: 4.5,
    time: '15–25 min',
    emoji: '🍔',
    color: '#ffe6dc',
    foods: [
      { id: 201, name: 'Classic Burger', price: 120, emoji: '🍔' },
      { id: 202, name: 'French Fries', price: 80, emoji: '🍟' },
      { id: 203, name: 'Cheese Pizza', price: 220, emoji: '🍕' },
    ],
  },
  {
    id: 3,
    name: 'Sweet Treats',
    cuisine: 'Desserts • Beverages',
    rating: 4.8,
    time: '15–20 min',
    emoji: '🍰',
    color: '#fce4f1',
    foods: [
      { id: 301, name: 'Chocolate Cake', price: 110, emoji: '🍰' },
      { id: 302, name: 'Vanilla Ice Cream', price: 70, emoji: '🍨' },
      { id: 303, name: 'Cold Coffee', price: 100, emoji: '🥤' },
    ],
  },
]

function App() {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [message, setMessage] = useState('')

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')

  
useEffect(() => {
  const fetchOrders = async () => {
    setOrdersLoading(true)
    setOrdersError('')

    try {
      const response = await fetch('http://localhost:5000/api/orders')

      if (!response.ok) {
        throw new Error('Could not load your order history.')
      }

      const data = await response.json()
      setOrders(data)
    } catch (error) {
      setOrdersError(error.message)
    } finally {
      setOrdersLoading(false)
    }
  }

  fetchOrders()
}, [])


  const allFoods = restaurants.flatMap((restaurant) =>
    restaurant.foods.map((food) => ({
      ...food,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    })),
  )

  const visibleFoods = allFoods.filter((food) =>
    `${food.name} ${food.restaurantName}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const addToCart = (food) => {
    setCart((previous) => {
      const existing = previous.find((item) => item.id === food.id)

      if (existing) {
        return previous.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...previous, { ...food, quantity: 1 }]
    })
    setMessage(`${food.name} added to your cart!`)
  }

  const updateQuantity = (id, change) => {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + change }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  
const placeOrder = async () => {
  console.log('Place order button clicked!')
  if (!cart.length) {
    setMessage('Please add food to your cart first.')
    return
  }

  try {
    setMessage('Placing your order...')

    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          restaurantName: item.restaurantName,
        })),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Could not place your order.')
    }

    setMessage(
      `Order ${data.order.orderNumber} placed successfully! Total: ₹${data.order.total}`,
    )
    setCart([])
  } catch (error) {
    console.error('Order error:', error)
    setMessage(
      error.message === 'Failed to fetch'
        ? 'Cannot reach the backend. Check that it is running.'
        : error.message,
    )
  }
}


  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#">
          <span className="brand-icon">🍽️</span>
          <span>Crave<span className="brand-accent">Kart</span></span>
        </a>
        <a className="cart-link" href="#cart">
          🛒 Cart <span className="cart-count">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">GOOD FOOD, GOOD MOOD</span>
            <h1>Your next favourite<br />meal is just a click away.</h1>
            <p>Discover delicious food from restaurants around you.</p>
            <a className="primary-button" href="#menu">Explore menu →</a>
          </div>
          <div className="hero-food">🍕</div>
          <div className="hero-decoration">🍔　🍟　🥤</div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MADE FOR YOUR CRAVINGS</span>
              <h2>Explore our menu</h2>
            </div>
            <span className="food-count">{visibleFoods.length} items</span>
          </div>

          <input
            className="search"
            type="search"
            placeholder="🔎  Search food or restaurant..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {message && (
            <div className="message" role="status">
              {message}
              <button onClick={() => setMessage('')}>✕</button>
            </div>
          )}

          <div className="restaurant-list">
            {restaurants
              .filter((restaurant) =>
                `${restaurant.name} ${restaurant.cuisine}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((restaurant) => (
                <article className="restaurant-card" key={restaurant.id}>
                  <div
                    className="restaurant-art"
                    style={{ background: restaurant.color }}
                  >
                    <span>{restaurant.emoji}</span>
                    <span className="rating">⭐ {restaurant.rating}</span>
                  </div>
                  <div className="restaurant-info">
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.cuisine}</p>
                    <small>🕒 {restaurant.time}</small>
                  </div>
                  <div className="food-list">
                    {restaurant.foods
                      .filter((food) =>
                        `${food.name} ${restaurant.name}`
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                      )
                      .map((food) => (
                        <div className="food-row" key={food.id}>
                          <span className="food-emoji">{food.emoji}</span>
                          <div className="food-details">
                            <strong>{food.name}</strong>
                            <span>₹{food.price}</span>
                          </div>
                          <button
                            className="add-button"
                            onClick={() =>
                              addToCart({
                                ...food,
                                restaurantId: restaurant.id,
                                restaurantName: restaurant.name,
                              })
                            }
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                  </div>
                </article>
              ))}
          </div>
        </section>

        <section className="cart-section" id="cart">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR SELECTION</span>
              <h2>Your cart 🛒</h2>
            </div>
          </div>

          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty. Add something tasty!</p>
          ) : (
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-row" key={item.id}>
                  <span>{item.emoji} {item.name}</span>
                  <div className="quantity">
                    <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                  <strong>₹{item.price * item.quantity}</strong>
                </div>
              ))}
            </div>
          )}

          <div className="cart-total">
            <span>Total</span>
            <strong>₹{total}</strong>
          </div>
          <button className="checkout-button" onClick={placeOrder}>
            Place demo order · ₹{total}
          </button>
          <p className="demo-note">
            Demo only: orders are not saved to a database yet.
          </p>
        </section>

        
<section className="cart-section" id="order-history">
  <div className="section-heading">
    <div>
      <span className="eyebrow">YOUR PAST ORDERS</span>
      <h2>Order History 📦</h2>
    </div>
  </div>

  {ordersLoading && <p>Loading your orders...</p>}

  {ordersError && (
    <p role="alert">{ordersError}</p>
  )}

  {!ordersLoading && !ordersError && orders.length === 0 && (
    <p>No orders found yet. Place your first order!</p>
  )}

  {orders.map((order) => (
    <article className="restaurant-card" key={order._id}>
      <div className="restaurant-info">
        <h3>Order {order.orderNumber}</h3>
        <p>Status: {order.status}</p>
        <p>
          {order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : 'Date unavailable'}
        </p>
      </div>

      <div className="food-list">
        {order.items.map((item, index) => (
          <div className="food-row" key={`${item.id}-${index}`}>
            <div className="food-details">
              <strong>{item.name}</strong>
              <span>
                {item.quantity} × ₹{item.price}
              </span>
            </div>
            <strong>₹{item.quantity * item.price}</strong>
          </div>
        ))}
      </div>

      <div className="cart-total">
        <span>Order total</span>
        <strong>₹{order.total}</strong>
      </div>
    </article>
  ))}
    </section>

      </main>

      <footer>
        <a className="brand" href="#">🍽️ Crave<span className="brand-accent">Kart</span></a>
        <p>Made with ❤️ for food lovers.</p>
        <small>Student DBMS Project · Online Food Delivery Management</small>
      </footer>
    </div>
  )
}

export default App
