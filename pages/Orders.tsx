import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { CheckCircle, Clock, Package, XCircle, Lock, Check } from 'lucide-react';

const mockOrders: Order[] = [
  { id: 'ORD-001', customerName: 'Rohan Das', items: [{ name: 'ALIVE Energy Drink', quantity: 2, price: 60 }, { name: 'Chips', quantity: 1, price: 20 }], total: 140, status: OrderStatus.PENDING, timestamp: '10:30 AM', otp: '1234' },
  { id: 'ORD-002', customerName: 'Priya Singh', items: [{ name: 'Oats 1kg', quantity: 1, price: 180 }], total: 180, status: OrderStatus.PACKED, timestamp: '11:15 AM', otp: '5678' },
  { id: 'ORD-003', customerName: 'Amit Patel', items: [{ name: 'Sugar 1kg', quantity: 2, price: 45 }], total: 90, status: OrderStatus.READY, timestamp: '11:45 AM', otp: '9988' },
];

interface OrderCardProps {
  order: Order;
  updateStatus: (id: string, newStatus: OrderStatus) => void;
  verifyingId: string | null;
  setVerifyingId: (id: string | null) => void;
  otpInput: string;
  setOtpInput: (val: string) => void;
  handleVerifyPickup: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  updateStatus, 
  verifyingId, 
  setVerifyingId, 
  otpInput, 
  setOtpInput, 
  handleVerifyPickup 
}) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-semibold text-white">{order.customerName}</h4>
        <span className="text-xs text-zinc-500">ID: {order.id} • {order.timestamp}</span>
      </div>
      <span className="text-red-500 font-bold">₹{order.total}</span>
    </div>
    
    <div className="py-2 border-t border-dashed border-zinc-800 space-y-1">
      {order.items.map((item, idx) => (
        <div key={idx} className="flex justify-between text-sm text-zinc-300">
          <span>{item.quantity}x {item.name}</span>
          <span className="text-zinc-500">₹{item.price * item.quantity}</span>
        </div>
      ))}
    </div>

    <div className="flex gap-2 mt-1">
      {order.status === OrderStatus.PENDING && (
        <button 
          onClick={() => updateStatus(order.id, OrderStatus.PACKED)}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium text-sm transition-colors"
        >
          Accept & Pack
        </button>
      )}
      {order.status === OrderStatus.PACKED && (
        <button 
          onClick={() => updateStatus(order.id, OrderStatus.READY)}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium text-sm transition-colors"
        >
          Mark Ready
        </button>
      )}
      {order.status === OrderStatus.READY && (
        <button 
          onClick={() => setVerifyingId(order.id)}
          className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Lock size={16} /> Verify Pickup
        </button>
      )}
    </div>

    {verifyingId === order.id && (
      <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-700 mt-2">
        <p className="text-xs text-zinc-400 mb-2">Enter 4-digit OTP from Customer</p>
        <div className="flex gap-2">
          <input 
            type="text" 
            maxLength={4}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-white text-center tracking-widest focus:outline-none focus:border-red-500"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            placeholder="0000"
          />
          <button 
            onClick={() => handleVerifyPickup(order)}
            className="bg-red-600 text-white px-4 rounded font-medium text-sm"
          >
            Verify
          </button>
        </div>
      </div>
    )}
  </div>
);

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleVerifyPickup = (order: Order) => {
    if (otpInput === order.otp) {
      updateStatus(order.id, OrderStatus.COMPLETED);
      setVerifyingId(null);
      setOtpInput('');
      alert("Order Verified Successfully!");
    } else {
      alert("Invalid OTP");
    }
  };

  const commonProps = {
    updateStatus,
    verifyingId,
    setVerifyingId,
    otpInput,
    setOtpInput,
    handleVerifyPickup
  };

  return (
    <div className="pb-20 md:pb-0">
      <h2 className="text-2xl font-bold text-white mb-6">Orders</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 mb-4 md:grid md:grid-cols-3 md:overflow-visible">
        
        <div className="min-w-[300px] flex-1">
            <div className="flex items-center gap-2 mb-4 text-zinc-400 font-medium uppercase text-xs tracking-wider">
                <Clock size={14} /> Pending ({orders.filter(o => o.status === OrderStatus.PENDING).length})
            </div>
            {orders.filter(o => o.status === OrderStatus.PENDING).map(order => (
              <OrderCard key={order.id} order={order} {...commonProps} />
            ))}
        </div>

        <div className="min-w-[300px] flex-1">
            <div className="flex items-center gap-2 mb-4 text-zinc-400 font-medium uppercase text-xs tracking-wider">
                <Package size={14} /> Processing ({orders.filter(o => o.status === OrderStatus.PACKED).length})
            </div>
            {orders.filter(o => o.status === OrderStatus.PACKED).map(order => (
              <OrderCard key={order.id} order={order} {...commonProps} />
            ))}
        </div>

        <div className="min-w-[300px] flex-1">
            <div className="flex items-center gap-2 mb-4 text-zinc-400 font-medium uppercase text-xs tracking-wider">
                <CheckCircle size={14} /> Ready for Pickup ({orders.filter(o => o.status === OrderStatus.READY).length})
            </div>
            {orders.filter(o => o.status === OrderStatus.READY).map(order => (
              <OrderCard key={order.id} order={order} {...commonProps} />
            ))}
        </div>

      </div>
    </div>
  );
};