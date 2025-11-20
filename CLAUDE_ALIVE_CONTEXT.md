# CLAUDE.md - ALIVE Advertising Project Context

## Project Overview
ALIVE Advertising is a dual-app platform solving the Kirana store crisis:
- **Kirana App**: Store owners monetize ad space and earn commissions
- **Customer App**: End-users discover discounted products at local Kiranas
- **Backend**: Orchestrates payments, real-time updates, dark store logistics

## Technology Stack
- **Backend**: Node.js + Express + Prisma ORM + PostgreSQL
- **Frontend**: React Native (Expo) + React Navigation + Zustand
- **Real-time**: Socket.io for live updates
- **Payments**: Razorpay integration
- **Storage**: AWS S3 (images, bills)
- **Maps**: Google Maps API
- **Deployment**: Railway (backend), EAS Build (mobile)

## Architecture Philosophy
- **Backend-first approach**: Solid APIs, then beautiful UI
- **Feature modularity**: Each feature is independently deployable
- **Real-time first**: Orders, inventory, notifications are live
- **Mobile-first**: Progressive enhancement for web if needed

---

## BACKEND STANDARDS

### Project Structure
```
backend/
├── src/
│   ├── models/              # NOT USED - Prisma handles this
│   ├── routes/              # All route handlers grouped by domain
│   │   ├── auth.js
│   │   ├── kirana.js
│   │   ├── customer.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   └── index.js         # Route aggregator
│   ├── controllers/         # Business logic (separate from routes)
│   │   ├── authController.js
│   │   ├── kiranaController.js
│   │   ├── orderController.js
│   │   └── ...
│   ├── middleware/          # Auth, validation, error handling
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validate.js
│   │   └── logger.js
│   ├── services/            # External integrations
│   │   ├── razorpay.js
│   │   ├── googleMaps.js
│   │   ├── s3Upload.js
│   │   ├── otp.js
│   │   └── notification.js
│   ├── utils/               # Helper functions
│   │   ├── jwt.js
│   │   ├── hasher.js
│   │   ├── validators.js
│   │   └── errors.js
│   ├── sockets/             # Socket.io handlers
│   │   ├── orderUpdate.js
│   │   └── inventory.js
│   ├── app.js               # Express setup
│   └── server.js            # Server start
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── .env.example
├── .env                     # (gitignored)
├── package.json
└── README.md
```

### Coding Standards

**Language**: TypeScript (with JSDoc for non-TS files)
```javascript
// Convert to TypeScript or use JSDoc
/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
async function login(email, password) {
  // ...
}
```

**Error Handling**: Custom error classes
```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

module.exports = { AppError, ValidationError, AuthError };
```

**Middleware Pattern**: Clean error propagation
```javascript
// Instead of try-catch everywhere, use wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/login', asyncHandler(async (req, res) => {
  const user = await authController.login(req.body);
  res.json({ success: true, user });
}));
```

**API Response Format**: Standardized
```javascript
// Success
res.json({
  success: true,
  data: { /* actual data */ },
  message: "Optional success message"
});

// Error (handled by global error middleware)
throw new ValidationError("Invalid email format");
```

**Environment Variables**: Always required
```javascript
// config.js
const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  RAZORPAY_KEY: process.env.RAZORPAY_KEY,
  // Throw early if missing
  validate() {
    if (!this.DATABASE_URL) throw new Error('DATABASE_URL not set');
  }
};
```

### Database Standards

**Prisma Conventions**:
- Models are PascalCase (KiranaStore, Customer, Order)
- Fields are camelCase (firstName, createdAt)
- Relations use @relation for clarity
- Always include timestamps (createdAt, updatedAt)
- Use proper enums for statuses

```prisma
model KiranaStore {
  id           String   @id @default(cuid())
  name         String
  ownerPhone   String   @unique
  location     String
  latitude     Float
  longitude    Float
  isActive     Boolean  @default(true)

  // Relations
  products     AdvertisedProduct[]
  orders       Order[]
  earnings     StoreEarning[]

  // Timestamps
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Migrations**:
```bash
# After schema change
npx prisma migrate dev --name <descriptive_name>

# NEVER use prisma db push in production
# Always use migrations
```

### API Design Standards

**RESTful Conventions**:
```
GET    /api/kirana/:id           - Get store
POST   /api/kirana              - Create store
PUT    /api/kirana/:id          - Full update
PATCH  /api/kirana/:id          - Partial update
DELETE /api/kirana/:id          - Delete

GET    /api/kirana/:id/orders   - Nested resource
POST   /api/kirana/:id/products - Create sub-resource
```

**Query Parameters**:
```javascript
// GET /products?category=grocery&limit=20&offset=0&sort=price:asc
const { category, limit = 10, offset = 0, sort = 'createdAt:desc' } = req.query;
```

**Request/Response**:
```javascript
// Request validation in controller
async function createKirana(req, res, next) {
  const { error, value } = validateKiranaData(req.body);
  if (error) throw new ValidationError(error.message);

  const kirana = await prisma.kiranaStore.create({ data: value });
  res.status(201).json({ success: true, data: kirana });
}

// Always return consistent structure
```

### Authentication & Security

**JWT Tokens**:
```javascript
// tokens last 24 hours
const token = jwt.sign(
  { userId, role: 'kirana' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Verify in middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AuthError('No token provided');

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    throw new AuthError('Invalid token');
  }
};
```

**Password Hashing** (if used):
```javascript
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
```

**OTP Service**:
```javascript
// services/otp.js
async function sendOTP(phone) {
  const otp = Math.random().toString().slice(2, 8);
  // Save to Redis with 5-min TTL
  // Send via SMS (Twilio, AWS SNS, etc.)
  return { success: true, otp }; // For development only
}

async function verifyOTP(phone, otp) {
  const stored = await redis.get(`otp:${phone}`);
  return stored === otp;
}
```

### Testing Standards

**Jest Setup**:
```javascript
// package.json
"test": "jest --coverage",
"test:watch": "jest --watch"

// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js'],
  coverageThreshold: { global: { lines: 70 } }
};
```

**Test Example**:
```javascript
// tests/auth.test.js
describe('Authentication', () => {
  test('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ phone: '9999999999', password: 'pass' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });
});
```

---

## MOBILE APP STANDARDS (React Native)

### Project Structure
```
kirana-app/ or customer-app/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── SignupScreen.js
│   │   │   └── OTPScreen.js
│   │   ├── home/
│   │   │   └── HomeScreen.js
│   │   ├── products/
│   │   │   ├── ProductListScreen.js
│   │   │   └── ProductDetailScreen.js
│   │   ├── orders/
│   │   │   ├── OrderListScreen.js
│   │   │   └── OrderDetailScreen.js
│   │   └── settings/
│   │       └── SettingsScreen.js
│   ├── navigation/
│   │   ├── AuthNavigator.js
│   │   ├── MainNavigator.js
│   │   └── RootNavigator.js
│   ├── components/
│   │   ├── UI/
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Header.js
│   │   │   └── LoadingSpinner.js
│   │   ├── Forms/
│   │   │   ├── LoginForm.js
│   │   │   └── AddressForm.js
│   │   └── Product/
│   │       ├── ProductCard.js
│   │       └── ProductList.js
│   ├── context/
│   │   ├── AuthContext.js       # Auth state
│   │   ├── OrderContext.js      # Order state
│   │   └── CartContext.js       # Cart state (Zustand alternative)
│   ├── store/                   # Zustand stores
│   │   ├── userStore.js
│   │   ├── cartStore.js
│   │   ├── orderStore.js
│   │   └── locationStore.js
│   ├── services/
│   │   ├── api.js               # Axios instance with interceptors
│   │   ├── auth.js              # Auth API calls
│   │   ├── products.js          # Product API calls
│   │   └── orders.js            # Order API calls
│   ├── utils/
│   │   ├── validation.js
│   │   ├── formatting.js
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── theme/
│   │   ├── colors.js
│   │   ├── spacing.js
│   │   └── typography.js
│   ├── App.js
│   └── index.js
├── app.json
├── .env.example
├── .env
└── package.json
```

### Coding Standards

**Functional Components with Hooks Only**:
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}
```

**Zustand Store Pattern**:
```javascript
// store/cartStore.js
import create from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, quantity) => set((state) => ({
    items: [...state.items, { ...product, quantity }]
  })),

  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.id !== productId)
  })),

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
}));

// In component
const { items, addItem, total } = useCartStore();
```

**API Service Layer**:
```javascript
// services/api.js
import axios from 'axios';
import { useAuthStore } from '../store/userStore';

const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    throw error;
  }
);

export default api;

// Usage in service
// services/products.js
import api from './api';

export const productService = {
  getAll: (filters) => api.get('/products', { params: filters }),
  getById: (id) => api.get(`/products/${id}`),
  getNearby: (lat, lng) => api.get('/products/nearby', { params: { lat, lng } }),
};
```

**Form Validation**:
```javascript
// utils/validation.js
export const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  phone: (phone) => /^[0-9]{10}$/.test(phone),
  password: (pwd) => pwd.length >= 8,
  required: (val) => val && val.trim().length > 0,
};

// Usage
const [email, setEmail] = useState('');
const [error, setError] = useState('');

const handleEmailChange = (value) => {
  setEmail(value);
  if (!validators.email(value)) {
    setError('Invalid email');
  } else {
    setError('');
  }
};
```

**Navigation Setup**:
```javascript
// navigation/RootNavigator.js
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useAuthStore } from '../store/userStore';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { token } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// MainNavigator with bottom tabs
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductListScreen} />
      <Tab.Screen name="Orders" component={OrderListScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
```

### Styling Standards

**Use React Native Paper for UI**:
```javascript
import { Button, Card, Text, TextInput } from 'react-native-paper';

// Consistent theming
<Card style={styles.card}>
  <Card.Content>
    <Text variant="headlineSmall">Product Name</Text>
  </Card.Content>
</Card>
```

**Theme Configuration**:
```javascript
// theme/index.js
export const theme = {
  colors: {
    primary: '#FF6B35',
    secondary: '#004E89',
    success: '#10B981',
    danger: '#EF4444',
    background: '#FFFFFF',
    text: '#1F2937',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: 'bold' },
    body: { fontSize: 14 },
  },
};
```

### Testing

**React Native Testing Library**:
```javascript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/auth/LoginScreen';

test('should show error on invalid email', async () => {
  const { getByTestId, getByText } = render(<LoginScreen />);

  fireEvent.changeText(getByTestId('email-input'), 'invalid');
  fireEvent.press(getByText('Login'));

  await waitFor(() => {
    expect(getByText('Invalid email')).toBeTruthy();
  });
});
```

---

## COMMON WORKFLOWS

### Adding a New Feature (Backend)

1. **Update Prisma Schema**:
   ```bash
   # Edit prisma/schema.prisma
   npx prisma migrate dev --name add_feature
   ```

2. **Create Route Handler**:
   ```javascript
   // routes/feature.js
   const router = express.Router();

   router.get('/', authMiddleware, controller.getAll);
   router.post('/', authMiddleware, controller.create);

   module.exports = router;
   ```

3. **Create Controller**:
   ```javascript
   // controllers/featureController.js
   module.exports = {
     getAll: async (req, res) => { ... },
     create: async (req, res) => { ... },
   };
   ```

4. **Register Route**:
   ```javascript
   // routes/index.js
   const featureRoutes = require('./feature');
   app.use('/api/feature', featureRoutes);
   ```

5. **Write Tests**:
   ```bash
   # tests/feature.test.js
   ```

6. **Commit**:
   ```bash
   git add .
   git commit -m "feat: add feature with API endpoints"
   ```

### Adding a New Screen (Mobile)

1. **Create Screen Component**:
   ```javascript
   // screens/feature/FeatureScreen.js
   import React, { useState, useEffect } from 'react';

   export default function FeatureScreen() { ... }
   ```

2. **Add Navigation**:
   ```javascript
   // navigation/MainNavigator.js
   import FeatureScreen from '../screens/feature/FeatureScreen';
   // Add to Tab.Screen
   ```

3. **Create API Service**:
   ```javascript
   // services/feature.js
   export const featureService = {
     getAll: () => api.get('/feature'),
   };
   ```

4. **Add State Management**:
   ```javascript
   // store/featureStore.js
   export const useFeatureStore = create((set) => ({
     items: [],
     // ...
   }));
   ```

5. **Test & Debug**:
   ```bash
   npx expo start
   # Scan QR code
   ```

---

## Key Principles to Maintain

✅ **DO**:
- Keep controllers thin, logic in services
- Use environment variables for config
- Handle errors consistently
- Write modular, reusable components
- Test critical paths
- Document complex logic
- Commit regularly with clear messages

❌ **DON'T**:
- Put business logic in routes
- Hardcode secrets or credentials
- Ignore error cases
- Create deeply nested components
- Use class components
- Commit untested code
- Use console.log (use logger)

---

## Getting Help

When stuck, ask Claude Code with context:
```
I'm working on [feature] in [app/backend].
Current issue: [describe]
Relevant files: @./path/to/file
Error message: [if applicable]

Think through the solution, then show me the code.
```

---

## Useful Commands

```bash
# Backend
npm run dev          # Start with nodemon
npm test             # Run Jest
npx prisma studio   # GUI for database

# Mobile
npx expo start       # Start dev server
npx expo prebuild    # Generate native code
npm test             # Run tests

# Git
git status
git add .
git commit -m "feat: [description]"
git push
```

---

Last Updated: 2025-11-20
Maintained By: ALIVE Team
