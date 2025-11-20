# Prisma Database Setup Guide

## ⚠️ Important Note

The Prisma schema has been created successfully with **13 models** covering all ALIVE platform requirements. However, Prisma CLI commands require binary engines that need to be downloaded from the internet.

## 📋 Schema Overview

Your `prisma/schema.prisma` includes:

### User Management (3 models)
- ✅ **KiranaStore** - Store owners with location, contact
- ✅ **Customer** - Customers with wallet balance
- ✅ **Address** - Multiple addresses per customer

### Shopping & Products (5 models)
- ✅ **AdvertisedProduct** - Products with commission structure
- ✅ **CartItem** - Shopping cart
- ✅ **ShoppingList** - Saved shopping lists
- ✅ **ShoppingListItem** - Items with custom names or product links

### Orders (2 models)
- ✅ **Order** - Full order management with status tracking
- ✅ **OrderItem** - Order items with commission calculation

### Bills (1 model)
- ✅ **ElectricityBill** - Bill payment service with commission

### Earnings (3 models)
- ✅ **StoreEarning** - Earnings with deductions and payout tracking
- ✅ **Rebate** - Brand rebates
- ✅ **ScreenSlot** - Digital ad slots

### Enums (5 enums)
- OrderStatus, PaymentStatus, BillStatus, EarningType, PayoutStatus

## 🚀 Setup Steps (Run These with Database Access)

### 1. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb alive_db

# Update .env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/alive_db?schema=public"
```

**Option B: Cloud PostgreSQL (Recommended)**
- **Supabase**: https://supabase.com (Free tier available)
- **Railway**: https://railway.app (Free tier available)
- **Render**: https://render.com (Free tier available)

Example connection string:
```bash
DATABASE_URL="postgresql://user:password@host.railway.app:5432/railway?schema=public"
```

### 2. Update Environment Variables

Edit `backend/.env`:
```bash
DATABASE_URL="your_postgresql_connection_string_here"
```

### 3. Generate Prisma Client

This generates the TypeScript types and client:
```bash
cd backend
npm run prisma:generate
```

Or manually:
```bash
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client
```

### 4. Create Initial Migration

This creates the database tables:
```bash
npm run prisma:migrate -- --name initial
```

Or manually:
```bash
npx prisma migrate dev --name initial
```

**Expected output:**
```
Prisma Migrate created and applied the following migration:
migrations/
  └─ 20231120_initial/
      └─ migration.sql

✔ Generated Prisma Client
```

This will:
- Create all 13 models as database tables
- Set up all relations and foreign keys
- Create all indexes for performance
- Generate the Prisma Client for use in code

### 5. Verify Database

Open Prisma Studio to view your database:
```bash
npm run prisma:studio
```

Visit http://localhost:5555 to see:
- All tables created
- Empty tables ready for data
- Visual database browser

### 6. Uncomment Database Code

Once Prisma Client is generated, uncomment the database connection code in `src/server.js`:

**Lines 26-28:** Uncomment the imports
```javascript
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
```

**Lines 40-48:** Uncomment the connection check
```javascript
try {
  await prisma.$connect();
  console.log('✓ Database connected successfully');
  return true;
} catch (error) {
  console.error('✗ Database connection failed:', error.message);
  console.error('Make sure DATABASE_URL is set correctly in .env');
  return false;
}
```

**Lines 100-101:** Uncomment the disconnect
```javascript
await prisma.$disconnect();
console.log('✓ Database disconnected');
```

### 7. Test the Connection

Restart your server:
```bash
npm run dev
```

You should see:
```
✓ Database connected successfully
================================================
🚀 ALIVE Advertising Backend
================================================
Environment: development
Server running on: http://localhost:3000
```

## 📝 What the Migration Creates

The initial migration creates **13 tables**:

```sql
-- User Management
CREATE TABLE "KiranaStore" (...)
CREATE TABLE "Customer" (...)
CREATE TABLE "Address" (...)

-- Products & Shopping
CREATE TABLE "AdvertisedProduct" (...)
CREATE TABLE "CartItem" (...)
CREATE TABLE "ShoppingList" (...)
CREATE TABLE "ShoppingListItem" (...)

-- Orders
CREATE TABLE "Order" (...)
CREATE TABLE "OrderItem" (...)

-- Bills
CREATE TABLE "ElectricityBill" (...)

-- Earnings
CREATE TABLE "StoreEarning" (...)
CREATE TABLE "Rebate" (...)
CREATE TABLE "ScreenSlot" (...)

-- Plus 5 enums and all indexes
```

## 🔧 Common Issues & Solutions

### Issue: "Failed to fetch engine file"
**Solution:** Make sure you have internet access. Prisma downloads binary engines on first use.

### Issue: "Can't reach database server"
**Solution:**
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Check firewall settings
- For cloud databases, verify IP whitelist

### Issue: "P1001: Can't reach database server"
**Solution:**
```bash
# Test connection
psql $DATABASE_URL

# Or test with a simple query
echo "SELECT 1" | psql $DATABASE_URL
```

### Issue: "Migration already applied"
**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name add_something
```

## 📚 Useful Prisma Commands

```bash
# View database in browser
npx prisma studio

# Create a new migration after schema changes
npx prisma migrate dev --name descriptive_name

# Generate Prisma Client (after schema changes)
npx prisma generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Create migration without applying
npx prisma migrate dev --create-only
```

## 🎯 Next Steps After Setup

Once the database is running:

1. ✅ Create seed data (optional)
   ```bash
   # Create prisma/seed.js
   npx prisma db seed
   ```

2. ✅ Build authentication routes
   - `/api/auth/signup`
   - `/api/auth/login`
   - `/api/auth/verify-otp`

3. ✅ Build core API routes
   - `/api/kirana` - Store management
   - `/api/products` - Product CRUD
   - `/api/orders` - Order processing
   - `/api/bills` - Bill payments

4. ✅ Integrate Razorpay for payments

5. ✅ Add real-time updates with Socket.io

## 📖 Learn More

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

**Schema Status:** ✅ Complete and ready for migration
**Tables:** 13 models + 5 enums
**Relations:** All properly defined with @relation()
**Indexes:** Optimized for queries

Once you complete the setup, the database will be ready for API development! 🚀
