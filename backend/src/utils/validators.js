/**
 * Validation Utilities
 * Reusable validation functions for data integrity
 */

import { ValidationError } from './errors.js';

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validatePhone = (phone) => {
  if (!phone) {
    throw new ValidationError('Phone number is required');
  }

  // Indian phone number: 10 digits starting with 6-9
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('Invalid phone number. Must be 10 digits starting with 6-9');
  }

  return true;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @param {boolean} required - Whether email is required
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validateEmail = (email, required = false) => {
  if (!email) {
    if (required) {
      throw new ValidationError('Email is required');
    }
    return true; // Optional email is valid if empty
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  return true;
};

/**
 * Validate GST number (Indian format)
 * Format: 22AAAAA0000A1Z5
 * @param {string} gstin - GST number to validate
 * @param {boolean} required - Whether GST is required
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validateGST = (gstin, required = false) => {
  if (!gstin) {
    if (required) {
      throw new ValidationError('GST number is required');
    }
    return true; // Optional GST is valid if empty
  }

  // GST format: 2 digits (state) + 10 chars (PAN) + 1 digit + 1 char (default Z) + 1 check digit
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(gstin)) {
    throw new ValidationError('Invalid GST format. Expected: 22AAAAA0000A1Z5');
  }

  return true;
};

/**
 * Validate pincode (Indian format)
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validatePincode = (pincode) => {
  if (!pincode) {
    throw new ValidationError('Pincode is required');
  }

  const pincodeRegex = /^[1-9][0-9]{5}$/;
  if (!pincodeRegex.test(pincode)) {
    throw new ValidationError('Invalid pincode. Must be 6 digits');
  }

  return true;
};

/**
 * Validate latitude
 * @param {number} lat - Latitude to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validateLatitude = (lat) => {
  if (lat === undefined || lat === null) {
    throw new ValidationError('Latitude is required');
  }

  const latitude = parseFloat(lat);
  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    throw new ValidationError('Invalid latitude. Must be between -90 and 90');
  }

  return true;
};

/**
 * Validate longitude
 * @param {number} lng - Longitude to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validateLongitude = (lng) => {
  if (lng === undefined || lng === null) {
    throw new ValidationError('Longitude is required');
  }

  const longitude = parseFloat(lng);
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    throw new ValidationError('Invalid longitude. Must be between -180 and 180');
  }

  return true;
};

/**
 * Validate required string field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @param {number} minLength - Minimum length (default: 1)
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validateRequired = (value, fieldName, minLength = 1) => {
  if (!value || typeof value !== 'string' || value.trim().length < minLength) {
    throw new ValidationError(`${fieldName} is required (minimum ${minLength} characters)`);
  }

  return true;
};

/**
 * Validate Kirana store data
 * @param {Object} data - Store data to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validateKiranaStore = (data) => {
  const {
    name,
    ownerName,
    ownerPhone,
    email,
    address,
    city,
    state,
    pincode,
    latitude,
    longitude,
    gstin,
    storeType,
  } = data;

  // Required fields
  validateRequired(name, 'Store name', 2);
  validateRequired(ownerName, 'Owner name', 2);
  validatePhone(ownerPhone);
  validateRequired(address, 'Address', 10);
  validateRequired(city, 'City', 2);
  validateRequired(state, 'State', 2);
  validatePincode(pincode);
  validateLatitude(latitude);
  validateLongitude(longitude);

  // Optional fields
  if (email) {
    validateEmail(email, false);
  }

  if (gstin) {
    validateGST(gstin, false);
  }

  if (storeType && !['general', 'grocery', 'medical', 'electronics', 'other'].includes(storeType)) {
    throw new ValidationError('Invalid store type. Must be: general, grocery, medical, electronics, or other');
  }

  return true;
};

/**
 * Validate partial Kirana store data (for updates)
 * @param {Object} data - Partial store data to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validateKiranaStoreUpdate = (data) => {
  const {
    name,
    ownerName,
    ownerPhone,
    email,
    city,
    state,
    pincode,
    latitude,
    longitude,
    gstin,
    storeType,
  } = data;

  // Validate only provided fields
  if (name !== undefined) {
    validateRequired(name, 'Store name', 2);
  }

  if (ownerName !== undefined) {
    validateRequired(ownerName, 'Owner name', 2);
  }

  if (ownerPhone !== undefined) {
    validatePhone(ownerPhone);
  }

  if (email !== undefined) {
    validateEmail(email, false);
  }

  if (city !== undefined) {
    validateRequired(city, 'City', 2);
  }

  if (state !== undefined) {
    validateRequired(state, 'State', 2);
  }

  if (pincode !== undefined) {
    validatePincode(pincode);
  }

  if (latitude !== undefined) {
    validateLatitude(latitude);
  }

  if (longitude !== undefined) {
    validateLongitude(longitude);
  }

  if (gstin !== undefined && gstin !== null) {
    validateGST(gstin, false);
  }

  if (storeType !== undefined) {
    if (!['general', 'grocery', 'medical', 'electronics', 'other'].includes(storeType)) {
      throw new ValidationError('Invalid store type. Must be: general, grocery, medical, electronics, or other');
    }
  }

  return true;
};

/**
 * Validate product data
 * @param {Object} data - Product data to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validateProduct = (data) => {
  const {
    name,
    brand,
    category,
    imageUrl,
    mrp,
    discountedPrice,
    discountPercent,
    stockQuantity,
    minOrderQty,
    maxOrderQty,
    commissionType,
    commissionValue,
  } = data;

  // Required fields
  validateRequired(name, 'Product name', 2);
  validateRequired(brand, 'Brand name', 2);
  validateRequired(category, 'Category', 2);
  validateRequired(imageUrl, 'Image URL', 5);

  // Pricing validation
  if (mrp === undefined || mrp === null) {
    throw new ValidationError('MRP is required');
  }

  const mrpValue = parseFloat(mrp);
  if (isNaN(mrpValue) || mrpValue <= 0) {
    throw new ValidationError('MRP must be a positive number');
  }

  if (discountedPrice === undefined || discountedPrice === null) {
    throw new ValidationError('Discounted price is required');
  }

  const discountedPriceValue = parseFloat(discountedPrice);
  if (isNaN(discountedPriceValue) || discountedPriceValue <= 0) {
    throw new ValidationError('Discounted price must be a positive number');
  }

  if (discountedPriceValue > mrpValue) {
    throw new ValidationError('Discounted price cannot be greater than MRP');
  }

  // Discount percent
  if (discountPercent !== undefined) {
    const discountPercentValue = parseFloat(discountPercent);
    if (isNaN(discountPercentValue) || discountPercentValue < 0 || discountPercentValue > 100) {
      throw new ValidationError('Discount percent must be between 0 and 100');
    }
  }

  // Stock quantity
  if (stockQuantity !== undefined) {
    const stockValue = parseInt(stockQuantity);
    if (isNaN(stockValue) || stockValue < 0) {
      throw new ValidationError('Stock quantity must be a non-negative integer');
    }
  }

  // Order quantity limits
  if (minOrderQty !== undefined) {
    const minValue = parseInt(minOrderQty);
    if (isNaN(minValue) || minValue < 1) {
      throw new ValidationError('Minimum order quantity must be at least 1');
    }
  }

  if (maxOrderQty !== undefined) {
    const maxValue = parseInt(maxOrderQty);
    if (isNaN(maxValue) || maxValue < 1) {
      throw new ValidationError('Maximum order quantity must be at least 1');
    }

    if (minOrderQty !== undefined) {
      const minValue = parseInt(minOrderQty);
      if (maxValue < minValue) {
        throw new ValidationError('Maximum order quantity must be greater than or equal to minimum');
      }
    }
  }

  // Commission validation
  if (commissionType !== undefined) {
    if (!['percentage', 'fixed'].includes(commissionType)) {
      throw new ValidationError('Commission type must be "percentage" or "fixed"');
    }
  }

  if (commissionValue !== undefined) {
    const commissionVal = parseFloat(commissionValue);
    if (isNaN(commissionVal) || commissionVal < 0) {
      throw new ValidationError('Commission value must be a non-negative number');
    }

    if (commissionType === 'percentage' && commissionVal > 100) {
      throw new ValidationError('Percentage commission cannot exceed 100%');
    }
  }

  return true;
};

/**
 * Validate product update data
 * @param {Object} data - Partial product data to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validateProductUpdate = (data) => {
  const {
    name,
    brand,
    category,
    imageUrl,
    mrp,
    discountedPrice,
    discountPercent,
    stockQuantity,
    minOrderQty,
    maxOrderQty,
    commissionType,
    commissionValue,
  } = data;

  // Validate only provided fields
  if (name !== undefined) {
    validateRequired(name, 'Product name', 2);
  }

  if (brand !== undefined) {
    validateRequired(brand, 'Brand name', 2);
  }

  if (category !== undefined) {
    validateRequired(category, 'Category', 2);
  }

  if (imageUrl !== undefined) {
    validateRequired(imageUrl, 'Image URL', 5);
  }

  // Pricing
  if (mrp !== undefined) {
    const mrpValue = parseFloat(mrp);
    if (isNaN(mrpValue) || mrpValue <= 0) {
      throw new ValidationError('MRP must be a positive number');
    }
  }

  if (discountedPrice !== undefined) {
    const discountedPriceValue = parseFloat(discountedPrice);
    if (isNaN(discountedPriceValue) || discountedPriceValue <= 0) {
      throw new ValidationError('Discounted price must be a positive number');
    }

    if (mrp !== undefined) {
      const mrpValue = parseFloat(mrp);
      if (discountedPriceValue > mrpValue) {
        throw new ValidationError('Discounted price cannot be greater than MRP');
      }
    }
  }

  if (discountPercent !== undefined) {
    const discountPercentValue = parseFloat(discountPercent);
    if (isNaN(discountPercentValue) || discountPercentValue < 0 || discountPercentValue > 100) {
      throw new ValidationError('Discount percent must be between 0 and 100');
    }
  }

  if (stockQuantity !== undefined) {
    const stockValue = parseInt(stockQuantity);
    if (isNaN(stockValue) || stockValue < 0) {
      throw new ValidationError('Stock quantity must be a non-negative integer');
    }
  }

  if (minOrderQty !== undefined) {
    const minValue = parseInt(minOrderQty);
    if (isNaN(minValue) || minValue < 1) {
      throw new ValidationError('Minimum order quantity must be at least 1');
    }
  }

  if (maxOrderQty !== undefined) {
    const maxValue = parseInt(maxOrderQty);
    if (isNaN(maxValue) || maxValue < 1) {
      throw new ValidationError('Maximum order quantity must be at least 1');
    }
  }

  if (commissionType !== undefined) {
    if (!['percentage', 'fixed'].includes(commissionType)) {
      throw new ValidationError('Commission type must be "percentage" or "fixed"');
    }
  }

  if (commissionValue !== undefined) {
    const commissionVal = parseFloat(commissionValue);
    if (isNaN(commissionVal) || commissionVal < 0) {
      throw new ValidationError('Commission value must be a non-negative number');
    }

    if (commissionType === 'percentage' && commissionVal > 100) {
      throw new ValidationError('Percentage commission cannot exceed 100%');
    }
  }

  return true;
};

export default {
  validatePhone,
  validateEmail,
  validateGST,
  validatePincode,
  validateLatitude,
  validateLongitude,
  validateRequired,
  validateKiranaStore,
  validateKiranaStoreUpdate,
  validateProduct,
  validateProductUpdate,
};
