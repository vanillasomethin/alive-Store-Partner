# ALIVE Advertising Backend

Backend API server for the ALIVE Advertising platform - connecting Kirana stores with customers and D2C brands.

## 🚀 Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **Dotenv** - Environment variables
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/              # API route handlers
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth, validation, error handling
│   │   └── errorHandler.js  # Global error handler
│   ├── services/            # External integrations
│   ├── utils/               # Helper functions
│   │   ├── errors.js        # Custom error classes
│   │   └── asyncHandler.js  # Error propagation wrapper
│   ├── sockets/             # Socket.io handlers
│   ├── app.js               # Express setup
│   └── server.js            # Server entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── .env.example             # Environment template
├── .env                     # Environment variables (gitignored)
├── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and update the following:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - A strong random string for JWT tokens
   - Other API keys as needed

3. **Set up the database:**
   ```bash
   # Run migrations to create tables
   npm run prisma:migrate

   # Generate Prisma Client
   npm run prisma:generate
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm start` | Start production server |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npm test` | Run tests (coming soon) |

## 🔌 API Endpoints

### Health Check

```
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "ALIVE Backend is running",
  "timestamp": "2025-11-20T08:29:33.025Z",
  "environment": "development"
}
```

### API Info

```
GET /api
```

**Response:**
```json
{
  "success": true,
  "message": "ALIVE Advertising API v1.0",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "api": "/api"
  }
}
```

## 🗄️ Database Schema

The database schema is defined in `prisma/schema.prisma` with **13 models** covering the entire platform.

📖 **See [PRISMA_SETUP.md](./PRISMA_SETUP.md) for detailed setup instructions**

### User Management (3 models)

- **KiranaStore** - Store owner accounts with location, contact, verification status
- **Customer** - Customer accounts with **wallet balance** for cashback/credits
- **Address** - Multiple addresses per customer (Home, Work, Other) with default flag

### Shopping & Products (5 models)

- **AdvertisedProduct** - Products with brand, price, discount, commission structure
- **CartItem** - Shopping cart items
- **ShoppingList** - Saved shopping lists with custom names
- **ShoppingListItem** - List items that can link to products OR be custom items

### Orders (2 models)

- **Order** - Customer orders with status tracking, payment details, commission
- **OrderItem** - Individual items in orders with product snapshot and commission

### Electricity Bills (1 model)

- **ElectricityBill** - Bill payment service
  - Customer uploads bill image
  - Kirana processes payment
  - Service charge + commission tracking
  - Status: PENDING → PAID

### Earnings & Monetization (3 models)

- **StoreEarning** - All earnings with deductions and **payout tracking**
  - Types: ORDER_COMMISSION, BILL_COMMISSION, SCREEN_AD, REFERRAL, BONUS
  - Payout status, date, method, reference number
- **Rebate** - Brand rebate offers with validity and conditions
- **ScreenSlot** - Digital ad slots with impression/click tracking

### Enums (5 total)

- **OrderStatus** - PENDING → CONFIRMED → PREPARING → COMPLETED
- **PaymentStatus** - PENDING → COMPLETED
- **BillStatus** - PENDING → PAID
- **EarningType** - ORDER_COMMISSION, BILL_COMMISSION, SCREEN_AD, etc.
- **PayoutStatus** - PENDING → COMPLETED

### Key Features

- ✅ Comprehensive timestamps (createdAt, updatedAt)
- ✅ Proper relations with @relation() and cascading deletes
- ✅ Indexed fields for performance (phone, location, status, dates)
- ✅ Location support (latitude/longitude) for nearby search
- ✅ Customer wallet for cashback/credits
- ✅ Multiple addresses with default flag
- ✅ Shopping lists with custom items
- ✅ Complete payout tracking system
- ✅ Bill payment service integration

## 🔒 Error Handling

The backend uses a standardized error handling approach:

### Custom Error Classes

Located in `src/utils/errors.js`:

- `ValidationError` (400) - Invalid request data
- `AuthError` (401) - Unauthorized access
- `ForbiddenError` (403) - Insufficient permissions
- `NotFoundError` (404) - Resource not found
- `ConflictError` (409) - Duplicate resource
- `InternalError` (500) - Server error
- `ServiceUnavailableError` (503) - External service down

### Usage Example

```javascript
import { NotFoundError } from './utils/errors.js';
import asyncHandler from './utils/asyncHandler.js';

router.get('/product/:id', asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id }
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  res.json({ success: true, data: product });
}));
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Product not found",
    "statusCode": 404,
    "stack": "Error stack trace (development only)"
  }
}
```

## 🚦 Adding New Routes

1. **Create a route file** in `src/routes/`:
   ```javascript
   // src/routes/products.js
   import express from 'express';
   import asyncHandler from '../utils/asyncHandler.js';

   const router = express.Router();

   router.get('/', asyncHandler(async (req, res) => {
     const products = await prisma.product.findMany();
     res.json({ success: true, data: products });
   }));

   export default router;
   ```

2. **Register the route** in `src/app.js`:
   ```javascript
   import productRoutes from './routes/products.js';
   app.use(`${API_PREFIX}/products`, productRoutes);
   ```

## 🔐 Environment Variables

Key environment variables to configure:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret for JWT tokens | Random string |
| `RAZORPAY_KEY_ID` | Razorpay API key | `rzp_test_xxx` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | `AIza...` |
| `AWS_ACCESS_KEY_ID` | AWS S3 access key | For file uploads |

See `.env.example` for the complete list.

## 📊 Database Management

### View Database in GUI

```bash
npm run prisma:studio
```

Opens Prisma Studio at `http://localhost:5555`

### Create a Migration

After modifying `prisma/schema.prisma`:

```bash
npm run prisma:migrate -- --name add_new_feature
```

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

⚠️ **Warning:** This will delete all data!

## 🧪 Testing

Testing infrastructure coming soon. Planned:

- Unit tests with Jest
- Integration tests
- API endpoint tests
- Database mocking

## 🚀 Deployment

### Prerequisites

1. PostgreSQL database (Railway, Supabase, etc.)
2. Node.js hosting (Railway, Render, Heroku)
3. Environment variables configured

### Steps

1. Set `NODE_ENV=production`
2. Set up production database
3. Run migrations: `npm run prisma:migrate`
4. Start server: `npm start`

## 🤝 Contributing

When adding new features:

1. Follow the project structure
2. Use custom error classes
3. Wrap async handlers with `asyncHandler`
4. Update Prisma schema for database changes
5. Document new endpoints in this README

## 📚 References

- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [ALIVE Context Standards](../CLAUDE_ALIVE_CONTEXT.md)

## 📝 License

MIT

---

**Built with ❤️ for ALIVE Advertising Platform**
