# 🛒 VueMart

A full-stack e-commerce application with an admin dashboard.

🔗 **[Live Demo](https://client-vuemart.vercel.app)**

![Vue.js](https://img.shields.io/badge/Vue_3-4FC08D?style=flat&logo=vuedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

---

## ✨ Features

**🛍️ Storefront**
- Product search, category filters & price range
- Shopping cart with coupon support
- Order placement & order history
- Product reviews & star ratings

**🔐 Auth**
- JWT authentication with httpOnly cookies
- Role-based access (customer / admin)

**📊 Admin Dashboard**
- Sales analytics & charts
- Product, order & coupon management

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vue 3, Vue Router, Pinia, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT, bcrypt |
| Build | Vite |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your-secret-key
PORT=3000
```

```bash
npm run seed   # Create tables & seed sample data
npm run dev    # Start server
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

```bash
npm run dev    # http://localhost:5173
```

### Default Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@vuemart.com` | `admin123` |
| Customer | `john@example.com` | `customer123` |

---

## 📁 Project Structure

```
VueMart/
├── frontend/
│   └── src/
│       ├── views/          # Pages (Home, Cart, Checkout, Admin...)
│       ├── components/     # Reusable components
│       ├── stores/         # Pinia stores (auth, cart)
│       ├── router/         # Route definitions
│       └── api.js          # Axios instance
├── backend/
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── db/                 # Pool, schema init, seed
│   └── server.js           # Express app
```

---

## 📡 API Routes

| Endpoint | Description |
|----------|-------------|
| `/api/auth` | Register, login, logout |
| `/api/products` | List, search, filter, CRUD |
| `/api/orders` | Create & manage orders |
| `/api/reviews` | Product reviews & ratings |
| `/api/coupons` | Discount codes |
| `/api/admin/stats` | Dashboard analytics |

---
