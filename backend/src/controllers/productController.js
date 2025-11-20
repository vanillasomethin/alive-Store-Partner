/**
 * Product Controller
 * Handles advertised products, stock management, and geolocation queries
 */

import { validateProduct, validateProductUpdate } from '../utils/validators.js';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../utils/errors.js';

// TEMPORARY: In-memory product storage (replace with Prisma once DB is ready)
// Structure: { id: { id, name, brand, category, kiranaStoreId, ... } }
const productMap = new Map();
let productIdCounter = 1;

// Import store map from kiranaController (in production, use Prisma)
// For now, we'll validate store exists by checking if it's passed
const storeMap = new Map(); // This should be shared or from Prisma

/**
 * Helper: Generate product ID
 */
const generateProductId = () => {
  return `product_${Date.now()}_${productIdCounter++}`;
};

/**
 * Helper: Calculate commission amount
 * @param {number} price - Product price
 * @param {string} commissionType - "percentage" or "fixed"
 * @param {number} commissionValue - Commission value
 * @returns {number} Commission amount
 */
const calculateCommission = (price, commissionType, commissionValue) => {
  if (commissionType === 'percentage') {
    return (price * commissionValue) / 100;
  }
  return commissionValue; // fixed amount
};

/**
 * Helper: Calculate distance between two coordinates (Haversine formula)
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
 * Add product to Kirana store
 * POST /api/kirana/:id/products
 * Body: { name, brand, category, description?, imageUrl, mrp, discountedPrice, discountPercent, stockQuantity?, commissionType?, commissionValue }
 */
export const addProductToStore = async (req, res) => {
  const { id: kiranaStoreId } = req.params;
  const productData = req.body;

  // Validate product data
  validateProduct(productData);

  // TODO: Verify store exists and user owns it
  // const store = await prisma.kiranaStore.findUnique({ where: { id: kiranaStoreId } });
  // if (!store) throw new NotFoundError('Store not found');
  // if (req.user.userId !== store.ownerId) throw new ForbiddenError(...);

  // Calculate discount percent if not provided
  const mrp = parseFloat(productData.mrp);
  const discountedPrice = parseFloat(productData.discountedPrice);
  const discountPercent =
    productData.discountPercent !== undefined
      ? parseFloat(productData.discountPercent)
      : ((mrp - discountedPrice) / mrp) * 100;

  // Create product
  const product = {
    id: generateProductId(),
    kiranaStoreId,
    name: productData.name,
    brand: productData.brand,
    category: productData.category,
    description: productData.description || null,
    imageUrl: productData.imageUrl,
    mrp,
    discountedPrice,
    discountPercent: parseFloat(discountPercent.toFixed(2)),
    stockQuantity: productData.stockQuantity !== undefined ? parseInt(productData.stockQuantity) : 0,
    minOrderQty: productData.minOrderQty !== undefined ? parseInt(productData.minOrderQty) : 1,
    maxOrderQty: productData.maxOrderQty !== undefined ? parseInt(productData.maxOrderQty) : 10,
    commissionType: productData.commissionType || 'percentage',
    commissionValue: productData.commissionValue !== undefined ? parseFloat(productData.commissionValue) : 5,
    isActive: true,
    isAvailable: productData.stockQuantity > 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Calculate commission for this product
  product.calculatedCommission = calculateCommission(
    product.discountedPrice,
    product.commissionType,
    product.commissionValue
  );

  productMap.set(product.id, product);

  // TODO: Replace with Prisma
  // const product = await prisma.advertisedProduct.create({
  //   data: {
  //     kiranaStoreId,
  //     name: productData.name,
  //     brand: productData.brand,
  //     category: productData.category,
  //     ...
  //   },
  //   include: { kiranaStore: true },
  // });

  res.status(201).json({
    success: true,
    message: 'Product added successfully',
    data: product,
  });
};

/**
 * List all products with filters
 * GET /api/products?category=grocery&brand=Amul&minMargin=10&limit=20&offset=0
 */
export const listProducts = async (req, res) => {
  const {
    category,
    brand,
    kiranaStoreId,
    minMargin,
    maxMargin,
    inStock,
    isActive,
    limit = 20,
    offset = 0,
  } = req.query;

  let products = Array.from(productMap.values());

  // Apply filters
  if (category) {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (brand) {
    products = products.filter((p) => p.brand.toLowerCase().includes(brand.toLowerCase()));
  }

  if (kiranaStoreId) {
    products = products.filter((p) => p.kiranaStoreId === kiranaStoreId);
  }

  // Filter by commission margin
  if (minMargin !== undefined) {
    const minMarginValue = parseFloat(minMargin);
    products = products.filter((p) => {
      const margin =
        p.commissionType === 'percentage'
          ? p.commissionValue
          : (p.commissionValue / p.discountedPrice) * 100;
      return margin >= minMarginValue;
    });
  }

  if (maxMargin !== undefined) {
    const maxMarginValue = parseFloat(maxMargin);
    products = products.filter((p) => {
      const margin =
        p.commissionType === 'percentage'
          ? p.commissionValue
          : (p.commissionValue / p.discountedPrice) * 100;
      return margin <= maxMarginValue;
    });
  }

  // Filter by stock availability
  if (inStock !== undefined) {
    const hasStock = inStock === 'true';
    products = products.filter((p) => (hasStock ? p.stockQuantity > 0 : true));
  }

  if (isActive !== undefined) {
    const active = isActive === 'true';
    products = products.filter((p) => p.isActive === active);
  }

  // Pagination
  const totalCount = products.length;
  const paginatedProducts = products.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // TODO: Replace with Prisma
  // const [products, totalCount] = await Promise.all([
  //   prisma.advertisedProduct.findMany({
  //     where: {
  //       ...(category && { category }),
  //       ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
  //       ...(kiranaStoreId && { kiranaStoreId }),
  //       ...(inStock === 'true' && { stockQuantity: { gt: 0 } }),
  //       ...(isActive !== undefined && { isActive: isActive === 'true' }),
  //     },
  //     include: {
  //       kiranaStore: { select: { id: true, name: true, city: true } },
  //     },
  //     take: parseInt(limit),
  //     skip: parseInt(offset),
  //     orderBy: { createdAt: 'desc' },
  //   }),
  //   prisma.advertisedProduct.count({ where: { /* same filters */ } }),
  // ]);

  res.status(200).json({
    success: true,
    data: {
      products: paginatedProducts,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount,
      },
    },
  });
};

/**
 * Get products near customer location
 * GET /api/products/nearby?lat=19.076&lng=72.8777&radius=5&category=grocery
 */
export const getNearbyProducts = async (req, res) => {
  const { lat, lng, radius = 5, category, brand, inStock } = req.query;

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

  // For now, we need store locations - in production, join with kiranaStore
  // Mock store locations - dynamically fetch from storeMap in production
  const mockStoreLocations = {
    kirana_1763647047846_1: { latitude: 19.076, longitude: 72.8777 },
    kirana_1763647083749_2: { latitude: 19.0825, longitude: 72.8808 },
    kirana_1763648585229_1: { latitude: 19.076, longitude: 72.8777 }, // Test store
  };

  // Filter products by nearby stores
  let products = Array.from(productMap.values()).filter((product) => {
    const storeLocation = mockStoreLocations[product.kiranaStoreId];
    if (!storeLocation) return false;

    const distance = calculateDistance(
      latitude,
      longitude,
      storeLocation.latitude,
      storeLocation.longitude
    );
    return distance <= searchRadius && product.isActive;
  });

  // Apply additional filters
  if (category) {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (brand) {
    products = products.filter((p) => p.brand.toLowerCase().includes(brand.toLowerCase()));
  }

  if (inStock === 'true') {
    products = products.filter((p) => p.stockQuantity > 0);
  }

  // Add distance to each product
  const productsWithDistance = products.map((product) => {
    const storeLocation = mockStoreLocations[product.kiranaStoreId];
    const distance = calculateDistance(
      latitude,
      longitude,
      storeLocation.latitude,
      storeLocation.longitude
    );
    return { ...product, distance };
  });

  // Sort by distance
  productsWithDistance.sort((a, b) => a.distance - b.distance);

  // TODO: Replace with Prisma geospatial query
  // const products = await prisma.$queryRaw`
  //   SELECT p.*, k.latitude, k.longitude,
  //     ( 6371 * acos( cos( radians(${latitude}) )
  //       * cos( radians( k.latitude ) )
  //       * cos( radians( k.longitude ) - radians(${longitude}) )
  //       + sin( radians(${latitude}) )
  //       * sin( radians( k.latitude ) ) ) ) AS distance
  //   FROM "AdvertisedProduct" p
  //   JOIN "KiranaStore" k ON p."kiranaStoreId" = k.id
  //   WHERE p."isActive" = true
  //   HAVING distance <= ${searchRadius}
  //   ORDER BY distance
  //   LIMIT 50
  // `;

  res.status(200).json({
    success: true,
    data: {
      location: { latitude, longitude },
      radius: searchRadius,
      count: productsWithDistance.length,
      products: productsWithDistance,
    },
  });
};

/**
 * Get product details by ID
 * GET /api/products/:id
 */
export const getProduct = async (req, res) => {
  const { id } = req.params;

  const product = productMap.get(id);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // TODO: Replace with Prisma
  // const product = await prisma.advertisedProduct.findUnique({
  //   where: { id },
  //   include: {
  //     kiranaStore: {
  //       select: {
  //         id: true,
  //         name: true,
  //         address: true,
  //         city: true,
  //         ownerPhone: true,
  //         latitude: true,
  //         longitude: true,
  //       },
  //     },
  //   },
  // });
  // if (!product) throw new NotFoundError('Product not found');

  res.status(200).json({
    success: true,
    data: product,
  });
};

/**
 * Update product (stock, price, etc.)
 * PUT /api/kirana/:id/products/:pid
 * Body: Partial product data
 */
export const updateProduct = async (req, res) => {
  const { id: kiranaStoreId, pid: productId } = req.params;
  const updateData = req.body;

  // Validate update data
  if (Object.keys(updateData).length > 0) {
    validateProductUpdate(updateData);
  }

  // Get product
  const product = productMap.get(productId);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Verify product belongs to this store
  if (product.kiranaStoreId !== kiranaStoreId) {
    throw new ForbiddenError('Product does not belong to this store');
  }

  // TODO: Add auth check - only owner can update
  // if (req.user.userId !== store.ownerId) throw new ForbiddenError(...);

  // Update product
  const updatedProduct = {
    ...product,
    ...updateData,
    mrp: updateData.mrp !== undefined ? parseFloat(updateData.mrp) : product.mrp,
    discountedPrice:
      updateData.discountedPrice !== undefined
        ? parseFloat(updateData.discountedPrice)
        : product.discountedPrice,
    discountPercent:
      updateData.discountPercent !== undefined
        ? parseFloat(updateData.discountPercent)
        : product.discountPercent,
    stockQuantity:
      updateData.stockQuantity !== undefined ? parseInt(updateData.stockQuantity) : product.stockQuantity,
    minOrderQty:
      updateData.minOrderQty !== undefined ? parseInt(updateData.minOrderQty) : product.minOrderQty,
    maxOrderQty:
      updateData.maxOrderQty !== undefined ? parseInt(updateData.maxOrderQty) : product.maxOrderQty,
    commissionValue:
      updateData.commissionValue !== undefined
        ? parseFloat(updateData.commissionValue)
        : product.commissionValue,
    isAvailable: updateData.stockQuantity !== undefined ? updateData.stockQuantity > 0 : product.isAvailable,
    updatedAt: new Date().toISOString(),
  };

  // Recalculate commission
  updatedProduct.calculatedCommission = calculateCommission(
    updatedProduct.discountedPrice,
    updatedProduct.commissionType,
    updatedProduct.commissionValue
  );

  productMap.set(productId, updatedProduct);

  // TODO: Replace with Prisma
  // const updatedProduct = await prisma.advertisedProduct.update({
  //   where: { id: productId },
  //   data: updateData,
  // });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct,
  });
};

/**
 * Remove product from store
 * DELETE /api/kirana/:id/products/:pid
 */
export const removeProduct = async (req, res) => {
  const { id: kiranaStoreId, pid: productId } = req.params;

  // Get product
  const product = productMap.get(productId);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Verify product belongs to this store
  if (product.kiranaStoreId !== kiranaStoreId) {
    throw new ForbiddenError('Product does not belong to this store');
  }

  // TODO: Add auth check - only owner can delete
  // if (req.user.userId !== store.ownerId) throw new ForbiddenError(...);

  // Soft delete - set isActive to false
  product.isActive = false;
  product.updatedAt = new Date().toISOString();
  productMap.set(productId, product);

  // Or hard delete
  // productMap.delete(productId);

  // TODO: Replace with Prisma
  // await prisma.advertisedProduct.update({
  //   where: { id: productId },
  //   data: { isActive: false },
  // });
  // Or hard delete:
  // await prisma.advertisedProduct.delete({ where: { id: productId } });

  res.status(200).json({
    success: true,
    message: 'Product removed successfully',
  });
};

export default {
  addProductToStore,
  listProducts,
  getNearbyProducts,
  getProduct,
  updateProduct,
  removeProduct,
};
