import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  Flame,
  Leaf,
  Beef,
  Sparkles,
  PlusCircle,
  X
} from 'lucide-react';
import { usePos } from '../../context/PosContext.tsx';
import { MenuItem, MenuItemAddOn } from '../../types/pos.ts';

export const MenuManager: React.FC = () => {
  const { db, saveMenuItem } = usePos();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

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

  const filteredItems = menu.filter((item) => {
    // Pure Veg filter
    if (vegOnly && !item.isVeg) return false;

    // Real-time search by dish name, category, or Tamil script
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchTamil = item.tamilName ? item.tamilName.toLowerCase().includes(q) : false;
      const matchAddOn = item.addOns ? item.addOns.some((a) => a.name.toLowerCase().includes(q)) : false;

      // Must match at least one attribute
      if (!matchName && !matchCategory && !matchTamil && !matchAddOn) {
        return false;
      }

      // If a specific category tab is active, allow match if it's within the tab OR if the user searched for the category itself
      if (selectedCategory !== 'All') {
        const isInSelectedCategory = item.category === selectedCategory;
        if (!isInSelectedCategory && !matchCategory) {
          return false;
        }
      }

      return true;
    }

    // Default category filter when search is empty
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  const handleToggleAvailability = async (item: MenuItem) => {
    await saveMenuItem({
      id: item.id,
      isAvailable: !item.isAvailable
    });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    await saveMenuItem(editingItem);
    setEditingItem(null);
  };

  const handleAddOnAdd = () => {
    if (!editingItem) return;
    const currentAddOns = editingItem.addOns || [];
    setEditingItem({
      ...editingItem,
      addOns: [...currentAddOns, { name: '', price: 15 }]
    });
  };

  const handleAddOnRemove = (index: number) => {
    if (!editingItem || !editingItem.addOns) return;
    const nextAddOns = editingItem.addOns.filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, addOns: nextAddOns });
  };

  const handleAddOnChange = (index: number, field: keyof MenuItemAddOn, value: any) => {
    if (!editingItem || !editingItem.addOns) return;
    const nextAddOns = [...editingItem.addOns];
    nextAddOns[index] = {
      ...nextAddOns[index],
      [field]: field === 'price' ? Number(value) : value
    };
    setEditingItem({ ...editingItem, addOns: nextAddOns });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <span>Menu & Pricing Management ({menu.length} Dishes)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure item pricing, Tamil names, spice options, add-ons, parcel fees, and instant 86/stock toggling
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem({
              name: '',
              tamilName: '',
              category: 'Breakfast / Tiffin',
              price: 100,
              isVeg: true,
              isAvailable: true,
              stockQuantity: null,
              parcelCharge: 10,
              spiceOptions: ['Mild', 'Medium', 'Spicy'],
              addOns: []
            });
          }}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-600/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Menu Item</span>
        </button>
      </div>

      {/* Real-time Search & Filter Controls */}
      <div className="space-y-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl">
        {/* Main Real-Time Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" />
            <input
              id="menu-search-input"
              name="menuSearch"
              type="text"
              placeholder="Search menu items by name or category (e.g. Biryani, Tiffin, Meals, Starters)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search menu items by name or category"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-24 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition shadow-inner"
            />
            {/* Real-time count & Clear button */}
            <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="bg-slate-800/90 text-slate-300 font-mono text-[11px] px-2 py-1 rounded-lg border border-slate-700/60 font-semibold">
                {filteredItems.length} found
              </span>
            </div>
          </div>

          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border whitespace-nowrap ${
              vegOnly
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>Pure Veg Only</span>
          </button>
        </div>

        {/* Quick Search Chips & Category Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/60">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Search Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] text-slate-400">
            <span className="hidden lg:inline text-slate-500 font-medium">Quick find:</span>
            {['Dosa', 'Biryani', 'Meals', 'Parotta', 'Chicken', 'Tea'].map((quickTag) => (
              <button
                key={quickTag}
                onClick={() => setSearchTerm(quickTag)}
                className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium transition whitespace-nowrap ${
                  searchTerm.toLowerCase() === quickTag.toLowerCase()
                    ? 'bg-amber-950 text-amber-300 border-amber-600'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {quickTag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-400 flex items-center justify-center shadow-lg">
            <Search className="w-7 h-7" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-black text-white">No dishes match your search</h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm
                ? `No dishes found matching "${searchTerm}". Try searching by category, alternative name, or clear filters.`
                : `No dishes found under category "${selectedCategory}".`}
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setVegOnly(false);
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-600/30"
          >
            Clear Search & Show All Dishes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-4 transition flex flex-col justify-between shadow-xl ${
                item.isAvailable
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/60 opacity-60 bg-slate-950/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {/* Veg / Non-veg indicator dot */}
                    <div
                      className={`w-4 h-4 border-2 rounded flex items-center justify-center p-0.5 ${
                        item.isVeg ? 'border-emerald-500' : 'border-rose-500'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm leading-snug">{item.name}</h4>
                      {item.tamilName && (
                        <div className="text-xs text-amber-400/90 font-medium">{item.tamilName}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-white font-mono text-base">₹{item.price}</div>
                    <div className="text-[10px] text-slate-400 font-medium">Parcel: +₹{item.parcelCharge}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 mb-2">
                  Category:{' '}
                  <span
                    className={`font-semibold px-1.5 py-0.5 rounded transition ${
                      searchTerm && item.category.toLowerCase().includes(searchTerm.toLowerCase().trim())
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-300'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>

                {/* Spice Options & Add-ons tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {item.spiceOptions?.map((sp) => (
                    <span
                      key={sp}
                      className="text-[10px] bg-red-950/60 border border-red-800/60 text-red-300 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"
                    >
                      <Flame className="w-2.5 h-2.5" /> {sp}
                    </span>
                  ))}
                  {item.addOns?.map((addon, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium border border-slate-700"
                    >
                      +{addon.name} (₹{addon.price})
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    item.isAvailable
                      ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/80'
                      : 'bg-rose-950/70 border border-rose-800 text-rose-300 hover:bg-rose-900/80'
                  }`}
                >
                  {item.isAvailable ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>In Stock (Serving)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>86 Out of Stock</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setEditingItem(item)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
                  title="Edit Dish"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add or Edit Menu Item */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl my-8">
            <h3 className="text-lg font-black text-white mb-4">
              {editingItem.id ? 'Edit Menu Dish' : 'Create New Menu Dish'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name (English)</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="e.g. Ghee Podi Roast"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tamil Name (தமிழ்)</label>
                  <input
                    type="text"
                    value={editingItem.tamilName || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, tamilName: e.target.value })}
                    placeholder="e.g. நெய் பொடி தோசை"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={editingItem.category || 'Breakfast / Tiffin'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Breakfast / Tiffin">Breakfast / Tiffin</option>
                    <option value="Meals & Thali">Meals & Thali</option>
                    <option value="Biryani & Rice">Biryani & Rice</option>
                    <option value="Starters & Snacks">Starters & Snacks</option>
                    <option value="Breads & Curries">Breads & Curries</option>
                    <option value="Beverages & Desserts">Beverages & Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dine-in Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingItem.price || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Parcel Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.parcelCharge ?? 10}
                    onChange={(e) => setEditingItem({ ...editingItem, parcelCharge: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Veg / Non Veg & In Stock */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isVeg ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, isVeg: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                  />
                  <span className="text-xs text-slate-300 font-medium">Vegetarian Dish</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isAvailable ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                  />
                  <span className="text-xs text-slate-300 font-medium">Available in Stock</span>
                </label>
              </div>

              {/* Add-ons Configuration */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">Add-on Customizations (e.g. Extra Sambar, Ghee)</label>
                  <button
                    type="button"
                    onClick={handleAddOnAdd}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Extra Option</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {editingItem.addOns?.map((addon, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add-on Name (e.g. Ghee Roast Upgrade)"
                        value={addon.name}
                        onChange={(e) => handleAddOnChange(index, 'name', e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="number"
                        placeholder="₹ Price"
                        value={addon.price}
                        onChange={(e) => handleAddOnChange(index, 'price', e.target.value)}
                        className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddOnRemove(index)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!editingItem.addOns || editingItem.addOns.length === 0) && (
                    <p className="text-xs text-slate-500 italic">No add-ons configured for this item yet.</p>
                  )}
                </div>
              </div>

              {/* Save & Cancel */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-600/30"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
