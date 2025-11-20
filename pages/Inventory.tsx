import React from 'react';
import { Product } from '../types';
import { Plus, ShoppingCart, Star } from 'lucide-react';

const products: Product[] = [
  { id: '1', name: 'ALIVE Energy (Red)', price: 450, stock: 12, imageUrl: 'https://picsum.photos/200/200?random=1', isSponsored: true, commission: 5 },
  { id: '2', name: 'Crunchy Oats Pack', price: 1200, stock: 4, imageUrl: 'https://picsum.photos/200/200?random=2', isSponsored: true, commission: 12 },
  { id: '3', name: 'Organic Honey', price: 340, stock: 25, imageUrl: 'https://picsum.photos/200/200?random=3', isSponsored: false, commission: 0 },
  { id: '4', name: 'Dark Chocolate Bar', price: 800, stock: 2, imageUrl: 'https://picsum.photos/200/200?random=4', isSponsored: true, commission: 8 },
  { id: '5', name: 'Sparkling Water', price: 200, stock: 40, imageUrl: 'https://picsum.photos/200/200?random=5', isSponsored: true, commission: 2 },
  { id: '6', name: 'Protein Bars (Box)', price: 1500, stock: 8, imageUrl: 'https://picsum.photos/200/200?random=6', isSponsored: false, commission: 0 },
];

export const Inventory: React.FC = () => {
  return (
    <div className="pb-20 md:pb-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Inventory & Ordering</h2>
        <button className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-zinc-200 transition-colors">
            <ShoppingCart size={16} /> My Cart (0)
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
            <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group hover:border-zinc-600 transition-all">
                <div className="relative aspect-square overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {product.isSponsored && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                            <Star size={10} fill="currentColor" /> ALIVE PICK
                        </div>
                    )}
                    {product.stock < 5 && (
                        <div className="absolute bottom-2 right-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                            LOW STOCK
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="text-white font-medium truncate">{product.name}</h3>
                    <div className="flex justify-between items-end mt-2">
                        <div>
                            <p className="text-zinc-400 text-xs">Wholesale</p>
                            <p className="text-white font-bold">₹{product.price}</p>
                        </div>
                        <button className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                            <Plus size={16} />
                        </button>
                    </div>
                    {product.isSponsored && (
                        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                             <span className="text-[10px] text-zinc-500">Commission/Unit</span>
                             <span className="text-green-500 text-xs font-bold">+₹{product.commission}</span>
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};