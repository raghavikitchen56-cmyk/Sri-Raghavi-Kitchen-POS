import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Leaf,
  Plus,
  Minus,
  Trash2,
  Package,
  Flame,
  Send,
  Sparkles,
  ShoppingBag,
  Check,
  X
} from 'lucide-react';
import { usePos } from '../../context/PosContext.tsx';
import { MenuItem, MenuItemAddOn, Table, Order } from '../../types/pos.ts';

interface WaiterOrderPadProps {
  table: Table;
  existingOrder?: Order | null;
  onClose: () => void;
  onOrderSubmitted: () => void;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  spiceLevel: string;
  selectedAddOns: MenuItemAddOn[];
  isParcel: boolean;
  notes: string;
}

export const WaiterOrderPad: React.FC<WaiterOrderPadProps> = ({
  table,
  existingOrder,
  onClose,
  onOrderSubmitted
}) => {
  const { db, currentUser, createOrder, addItemsToOrder } = usePos();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isEntireOrderParcel, setIsEntireOrderParcel] = useState<boolean>(false);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Customization modal state
  const [modalSpice, setModalSpice] = useState<string>('Medium');
  const [modalAddOns, setModalAddOns] = useState<MenuItemAddOn[]>([]);
  const [modalIsParcel, setModalIsParcel] = useState<boolean>(false);
  const [modalNotes, setModalNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const menu = db?.menu || [];
  const categories = [
    'All',
    'Breakfast / Tiffin',
    'Meals & Thali',
    'Biryani & Rice',
    'Starters & Snacks',
    'Breads & Curries',
    'Beverages & Desserts'
  ];

  const filteredMenu = menu.filter((item) => {
    if (!item.isAvailable) return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (vegOnly && !item.isVeg) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchTamil = item.tamilName ? item.tamilName.toLowerCase().includes(q) : false;
      const matchAddOn = item.addOns ? item.addOns.some((a) => a.name.toLowerCase().includes(q)) : false;
      if (!matchName && !matchCategory && !matchTamil && !matchAddOn) return false;
    }
    return true;
  });

  const handleOpenCustomize = (item: MenuItem) => {
    setCustomizingItem(item);
    setModalSpice(item.spiceOptions?.[0] || 'Medium');
    setModalAddOns([]);
    setModalIsParcel(isEntireOrderParcel);
    setModalNotes('');
  };

  const handleAddCustomizedToCart = () => {
    if (!customizingItem) return;

    setCart((prev) => {
      // Check if exact same config already exists in cart
      const existingIdx = prev.findIndex(
        (c) =>
          c.item.id === customizingItem.id &&
          c.spiceLevel === modalSpice &&
          c.isParcel === modalIsParcel &&
          c.notes === modalNotes &&
          JSON.stringify(c.selectedAddOns) === JSON.stringify(modalAddOns)
      );

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }

      return [
        ...prev,
        {
          item: customizingItem,
          quantity: 1,
          spiceLevel: modalSpice,
          selectedAddOns: modalAddOns,
          isParcel: modalIsParcel,
          notes: modalNotes
        }
      ];
    });

    setCustomizingItem(null);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      next[index].quantity += delta;
      if (next[index].quantity <= 0) {
        return next.filter((_, i) => i !== index);
      }
      return next;
    });
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((acc, c) => {
    const itemBase = c.item.price * c.quantity;
    const addOnBase = c.selectedAddOns.reduce((a, add) => a + add.price * c.quantity, 0);
    return acc + itemBase + addOnBase;
  }, 0);

  const cartParcelTotal = cart.reduce((acc, c) => {
    if (c.isParcel || isEntireOrderParcel) {
      return acc + (c.item.parcelCharge || 0) * c.quantity;
    }
    return acc;
  }, 0);

  const cartTax = Math.round((cartSubtotal * (db?.restaurant.gstPercentage || 5)) / 100);
  const cartGrandTotal = cartSubtotal + cartParcelTotal + cartTax;

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const payloadItems = cart.map((c) => ({
      itemId: c.item.id,
      name: c.item.name,
      tamilName: c.item.tamilName,
      quantity: c.quantity,
      unitPrice: c.item.price,
      spiceLevel: c.spiceLevel,
      selectedAddOns: c.selectedAddOns,
      notes: c.notes,
      isParcel: c.isParcel || isEntireOrderParcel,
      parcelCharge: c.item.parcelCharge || 0
    }));

    if (existingOrder) {
      // Add items to existing running order
      await addItemsToOrder(existingOrder.id, payloadItems);
    } else {
      // Create new order
      await createOrder({
        tableId: table.id,
        waiterId: currentUser?.id || 'w-1',
        items: payloadItems,
        isEntireOrderParcel
      });
    }

    setIsSubmitting(false);
    onOrderSubmitted();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                {existingOrder ? `Add to Order #${existingOrder.orderNumber}` : `New Order: Table ${table.tableNumber}`}
              </h2>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {table.section}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Waiter: <strong className="text-white">{currentUser?.name}</strong> • Capacity: {table.capacity} seats
            </p>
          </div>
        </div>

        {/* Entire Order Parcel Switch */}
        <label className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={isEntireOrderParcel}
            onChange={(e) => setIsEntireOrderParcel(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500"
          />
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
            <Package className="w-3.5 h-3.5" /> Entire Order Parcel
          </span>
        </label>
      </div>

      {/* Main Content: Split Menu (Left) and Live Cart (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Menu & Categories */}
        <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-5 space-y-3">
          {/* Search & Veg toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search dish, category (e.g. Biryani, Tiffin), or தமிழ்..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border whitespace-nowrap ${
                vegOnly
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Veg Only</span>
            </button>
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dishes Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenCustomize(item)}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/60 p-3.5 rounded-2xl cursor-pointer transition flex flex-col justify-between shadow-lg active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 border-2 rounded flex items-center justify-center p-0.5 ${
                          item.isVeg ? 'border-emerald-500' : 'border-rose-500'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        />
                      </div>
                      <h4 className="font-extrabold text-white text-sm leading-snug">{item.name}</h4>
                    </div>
                  </div>

                  {item.tamilName && (
                    <div className="text-xs text-amber-300/80 font-medium ml-5 mb-1">
                      {item.tamilName}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
                  <span className="text-base font-black text-white font-mono">₹{item.price}</span>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 flex items-center justify-center font-bold text-lg transition"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Cart Panel */}
        <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between shadow-2xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-white text-sm">Table {table.tableNumber} Cart</h3>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {cart.reduce((a, c) => a + c.quantity, 0)} Items
            </span>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-800/60">
            {cart.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                <ShoppingBag className="w-10 h-10 text-slate-700 mb-2" />
                <p>Cart is currently empty.</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Tap any menu dish on the left to add items.</p>
              </div>
            ) : (
              cart.map((c, idx) => (
                <div key={idx} className="pt-2.5 first:pt-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-xs leading-snug">{c.item.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">₹{c.item.price} each</div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
                      <button
                        onClick={() => handleUpdateQuantity(idx, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs font-mono">{c.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(idx, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Spice & Add-ons details */}
                  <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px]">
                    {c.spiceLevel && (
                      <span className="bg-red-950 text-red-300 border border-red-900 px-1.5 py-0.2 rounded font-semibold">
                        {c.spiceLevel}
                      </span>
                    )}
                    {(c.isParcel || isEntireOrderParcel) && (
                      <span className="bg-amber-950 text-amber-300 border border-amber-900 px-1.5 py-0.2 rounded font-semibold">
                        Parcel (+₹{c.item.parcelCharge})
                      </span>
                    )}
                    {c.selectedAddOns.map((a, i) => (
                      <span key={i} className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                        +{a.name}
                      </span>
                    ))}
                    {c.notes && (
                      <span className="italic text-slate-400 w-full block mt-0.5">Note: {c.notes}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Bottom Checkout */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>₹{cartSubtotal}</span>
              </div>
              {cartParcelTotal > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Parcel Packaging:</span>
                  <span>₹{cartParcelTotal}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>GST (5%):</span>
                <span>₹{cartTax}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-1.5 border-t border-slate-800">
                <span>Total:</span>
                <span className="text-amber-400">₹{cartGrandTotal}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting || cart.length === 0}
              onClick={handleSubmitOrder}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Transmitting Order...'
                  : existingOrder
                  ? `Send Additional Items to Kitchen`
                  : `Send Order to Kitchen Display`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Item Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-white">{customizingItem.name}</h3>
                {customizingItem.tamilName && (
                  <div className="text-xs text-amber-400">{customizingItem.tamilName}</div>
                )}
                <div className="text-sm font-bold text-white font-mono mt-1">₹{customizingItem.price}</div>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Spice Level */}
            {customizingItem.spiceOptions && customizingItem.spiceOptions.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Spice Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {customizingItem.spiceOptions.map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setModalSpice(sp)}
                      className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1 ${
                        modalSpice === sp
                          ? 'bg-red-950 border-red-500 text-red-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      <span>{sp}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {customizingItem.addOns && customizingItem.addOns.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Add-ons & Extras</label>
                <div className="space-y-1.5">
                  {customizingItem.addOns.map((add, idx) => {
                    const isSelected = modalAddOns.some((a) => a.name === add.name);
                    return (
                      <label
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setModalAddOns([...modalAddOns, add]);
                              } else {
                                setModalAddOns(modalAddOns.filter((a) => a.name !== add.name));
                              }
                            }}
                            className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                          />
                          <span className="text-xs font-medium text-slate-200">{add.name}</span>
                        </div>
                        <span className="text-xs font-bold text-amber-400 font-mono">+₹{add.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Parcel packing checkbox */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  <span>Parcel / Takeaway Packaging</span>
                </div>
                <div className="text-[10px] text-slate-400">Includes food container & bag</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 font-mono">
                  +₹{customizingItem.parcelCharge || 10}
                </span>
                <input
                  type="checkbox"
                  checked={modalIsParcel || isEntireOrderParcel}
                  disabled={isEntireOrderParcel}
                  onChange={(e) => setModalIsParcel(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                />
              </div>
            </div>

            {/* Cooking Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kitchen Cooking Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Less oil, extra crispy, separate sambar..."
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Add to Cart button */}
            <button
              type="button"
              onClick={handleAddCustomizedToCart}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Table Order</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
