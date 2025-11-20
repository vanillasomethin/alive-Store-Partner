export enum OrderStatus {
  PENDING = 'Pending',
  PACKED = 'Packed',
  READY = 'Ready',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface Order {
  id: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
  timestamp: string;
  otp: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  isSponsored: boolean;
  commission: number;
}

export enum ScreenStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  ERROR = 'Error'
}

export interface EarningsData {
  date: string;
  adRevenue: number;
  commission: number;
}

export interface RebateClaim {
  id: string;
  month: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  billImageUrl: string;
}