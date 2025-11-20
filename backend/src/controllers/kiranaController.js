/**
 * Kirana Store Controller
 * Handles store management, analytics, and CRUD operations
 */

import { validateKiranaStore, validateKiranaStoreUpdate } from '../utils/validators.js';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../utils/errors.js';

// TEMPORARY: In-memory store storage (replace with Prisma once DB is ready)
// Structure: { id: { id, name, ownerName, ownerPhone, ... } }
const storeMap = new Map();
let storeIdCounter = 1;

/**
 * Helper: Generate store ID
 */
const generateStoreId = () => {
  return `kirana_${Date.now()}_${storeIdCounter++}`;
};

/**
 * Helper: Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Create new Kirana store
 * POST /api/kirana
 * Body: { name, ownerName, ownerPhone, email?, address, city, state, pincode, latitude, longitude, gstin?, storeType? }
 */
export const createStore = async (req, res) => {
  const storeData = req.body;

  // Validate input
  validateKiranaStore(storeData);

  // Check if phone number already exists
  const existingStore = Array.from(storeMap.values()).find(
    (store) => store.ownerPhone === storeData.ownerPhone
  );

  if (existingStore) {
    throw new ConflictError('Store with this phone number already exists');
  }

  // TODO: Replace with Prisma
  // const existingStore = await prisma.kiranaStore.findUnique({
  //   where: { ownerPhone: storeData.ownerPhone }
  // });
  // if (existingStore) {
  //   throw new ConflictError('Store with this phone number already exists');
  // }

  // Create store
  const store = {
    id: generateStoreId(),
    name: storeData.name,
    ownerName: storeData.ownerName,
    ownerPhone: storeData.ownerPhone,
    email: storeData.email || null,
    address: storeData.address,
    city: storeData.city,
    state: storeData.state,
    pincode: storeData.pincode,
    latitude: parseFloat(storeData.latitude),
    longitude: parseFloat(storeData.longitude),
    storeType: storeData.storeType || 'general',
    gstin: storeData.gstin || null,
    isActive: true,
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  storeMap.set(store.id, store);

  // TODO: Replace with Prisma
  // const store = await prisma.kiranaStore.create({
  //   data: {
  //     name: storeData.name,
  //     ownerName: storeData.ownerName,
  //     ownerPhone: storeData.ownerPhone,
  //     email: storeData.email,
  //     address: storeData.address,
  //     city: storeData.city,
  //     state: storeData.state,
  //     pincode: storeData.pincode,
  //     latitude: parseFloat(storeData.latitude),
  //     longitude: parseFloat(storeData.longitude),
  //     storeType: storeData.storeType || 'general',
  //     gstin: storeData.gstin,
  //   },
  // });

  res.status(201).json({
    success: true,
    message: 'Store created successfully',
    data: store,
  });
};

/**
 * Get store by ID
 * GET /api/kirana/:id
 */
export const getStore = async (req, res) => {
  const { id } = req.params;

  const store = storeMap.get(id);

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  // TODO: Replace with Prisma
  // const store = await prisma.kiranaStore.findUnique({
  //   where: { id },
  //   include: {
  //     products: {
  //       where: { isActive: true },
  //       take: 10,
  //     },
  //     _count: {
  //       select: {
  //         products: true,
  //         orders: true,
  //       },
  //     },
  //   },
  // });
  // if (!store) {
  //   throw new NotFoundError('Store not found');
  // }

  res.status(200).json({
    success: true,
    data: store,
  });
};

/**
 * Update store information
 * PUT /api/kirana/:id
 * Body: Partial store data
 */
export const updateStore = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Validate update data
  validateKiranaStoreUpdate(updateData);

  // Get existing store
  const store = storeMap.get(id);

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  // TODO: Add auth check - only owner can update
  // if (req.user.userId !== store.ownerId) {
  //   throw new ForbiddenError('You can only update your own store');
  // }

  // Check if phone number is being changed and already exists
  if (updateData.ownerPhone && updateData.ownerPhone !== store.ownerPhone) {
    const existingStore = Array.from(storeMap.values()).find(
      (s) => s.ownerPhone === updateData.ownerPhone && s.id !== id
    );

    if (existingStore) {
      throw new ConflictError('Phone number already in use by another store');
    }
  }

  // Update store
  const updatedStore = {
    ...store,
    ...updateData,
    latitude: updateData.latitude !== undefined ? parseFloat(updateData.latitude) : store.latitude,
    longitude:
      updateData.longitude !== undefined ? parseFloat(updateData.longitude) : store.longitude,
    updatedAt: new Date().toISOString(),
  };

  storeMap.set(id, updatedStore);

  // TODO: Replace with Prisma
  // const updatedStore = await prisma.kiranaStore.update({
  //   where: { id },
  //   data: {
  //     ...updateData,
  //     latitude: updateData.latitude !== undefined ? parseFloat(updateData.latitude) : undefined,
  //     longitude: updateData.longitude !== undefined ? parseFloat(updateData.longitude) : undefined,
  //   },
  // });

  res.status(200).json({
    success: true,
    message: 'Store updated successfully',
    data: updatedStore,
  });
};

/**
 * Get store analytics
 * GET /api/kirana/:id/analytics
 */
export const getStoreAnalytics = async (req, res) => {
  const { id } = req.params;

  const store = storeMap.get(id);

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  // TODO: Replace with actual Prisma queries
  // const analytics = await prisma.kiranaStore.findUnique({
  //   where: { id },
  //   select: {
  //     _count: {
  //       select: {
  //         products: { where: { isActive: true } },
  //         orders: true,
  //         earnings: true,
  //       },
  //     },
  //     earnings: {
  //       select: {
  //         amount: true,
  //         netAmount: true,
  //         type: true,
  //       },
  //     },
  //     orders: {
  //       select: {
  //         status: true,
  //         finalAmount: true,
  //         commissionAmount: true,
  //       },
  //     },
  //   },
  // });

  // Mock analytics data
  const analytics = {
    storeId: store.id,
    storeName: store.name,

    // Overview
    overview: {
      totalProducts: 0,
      activeProducts: 0,
      totalOrders: 0,
      completedOrders: 0,
      totalEarnings: 0,
    },

    // Order statistics
    orders: {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      completed: 0,
      cancelled: 0,
    },

    // Earnings breakdown
    earnings: {
      orderCommissions: 0,
      screenAds: 0,
      billCommissions: 0,
      referrals: 0,
      bonuses: 0,
      totalEarned: 0,
      pendingPayout: 0,
      paidOut: 0,
    },

    // Performance metrics
    performance: {
      averageOrderValue: 0,
      averageCommission: 0,
      conversionRate: 0,
      customerRetention: 0,
    },

    // Recent activity
    recentActivity: {
      lastOrderDate: null,
      lastProductAdded: null,
      lastEarningDate: null,
    },

    // Location insights
    location: {
      city: store.city,
      state: store.state,
      nearbyStores: 0,
      coverageRadius: 5, // km
    },
  };

  res.status(200).json({
    success: true,
    data: analytics,
  });
};

/**
 * Get nearby stores
 * GET /api/kirana/nearby?lat=12.34&lng=56.78&radius=5
 */
export const getNearbyStores = async (req, res) => {
  const { lat, lng, radius = 5 } = req.query;

  // Validate coordinates
  if (!lat || !lng) {
    throw new ValidationError('Latitude and longitude are required');
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const searchRadius = parseFloat(radius);

  if (isNaN(latitude) || isNaN(longitude) || isNaN(searchRadius)) {
    throw new ValidationError('Invalid coordinates or radius');
  }

  // Find nearby stores
  const nearbyStores = Array.from(storeMap.values())
    .filter((store) => store.isActive)
    .map((store) => {
      const distance = calculateDistance(latitude, longitude, store.latitude, store.longitude);
      return { ...store, distance };
    })
    .filter((store) => store.distance <= searchRadius)
    .sort((a, b) => a.distance - b.distance);

  // TODO: Replace with Prisma geospatial query
  // const nearbyStores = await prisma.$queryRaw`
  //   SELECT *,
  //     ( 6371 * acos( cos( radians(${latitude}) )
  //       * cos( radians( latitude ) )
  //       * cos( radians( longitude ) - radians(${longitude}) )
  //       + sin( radians(${latitude}) )
  //       * sin( radians( latitude ) ) ) ) AS distance
  //   FROM "KiranaStore"
  //   WHERE "isActive" = true
  //   HAVING distance <= ${searchRadius}
  //   ORDER BY distance
  //   LIMIT 50
  // `;

  res.status(200).json({
    success: true,
    data: {
      location: { latitude, longitude },
      radius: searchRadius,
      count: nearbyStores.length,
      stores: nearbyStores,
    },
  });
};

/**
 * List all stores with filters
 * GET /api/kirana?city=Mumbai&storeType=grocery&isActive=true
 */
export const listStores = async (req, res) => {
  const { city, state, storeType, isActive, isVerified, limit = 20, offset = 0 } = req.query;

  // Build filters
  let stores = Array.from(storeMap.values());

  if (city) {
    stores = stores.filter((s) => s.city.toLowerCase() === city.toLowerCase());
  }

  if (state) {
    stores = stores.filter((s) => s.state.toLowerCase() === state.toLowerCase());
  }

  if (storeType) {
    stores = stores.filter((s) => s.storeType === storeType);
  }

  if (isActive !== undefined) {
    const active = isActive === 'true';
    stores = stores.filter((s) => s.isActive === active);
  }

  if (isVerified !== undefined) {
    const verified = isVerified === 'true';
    stores = stores.filter((s) => s.isVerified === verified);
  }

  // Pagination
  const totalCount = stores.length;
  const paginatedStores = stores.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // TODO: Replace with Prisma
  // const [stores, totalCount] = await Promise.all([
  //   prisma.kiranaStore.findMany({
  //     where: {
  //       ...(city && { city }),
  //       ...(state && { state }),
  //       ...(storeType && { storeType }),
  //       ...(isActive !== undefined && { isActive: isActive === 'true' }),
  //       ...(isVerified !== undefined && { isVerified: isVerified === 'true' }),
  //     },
  //     take: parseInt(limit),
  //     skip: parseInt(offset),
  //     orderBy: { createdAt: 'desc' },
  //   }),
  //   prisma.kiranaStore.count({
  //     where: { /* same filters */ },
  //   }),
  // ]);

  res.status(200).json({
    success: true,
    data: {
      stores: paginatedStores,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount,
      },
    },
  });
};

export default {
  createStore,
  getStore,
  updateStore,
  getStoreAnalytics,
  getNearbyStores,
  listStores,
};
