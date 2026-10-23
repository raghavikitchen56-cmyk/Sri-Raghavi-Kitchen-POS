import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  PosDatabase,
  Order,
  KitchenOrderTicket,
  KitchenRequest,
  Table,
  MenuItem,
  WaiterAccount,
  RestaurantSettings,
  SoundSettings,
  SseEvent
} from '../types/pos.ts';
import { soundManager } from '../utils/sound.ts';

interface CurrentUser {
  role: 'kitchen' | 'waiter';
  id: string;
  name: string;
  phone?: string;
}

interface PosContextType {
  db: PosDatabase;
  loading: boolean;
  currentUser: CurrentUser | null;
  audioUnlocked: boolean;
  activeNotification: { title: string; message: string; type: 'info' | 'success' | 'alert' } | null;
  loginAsKitchen: (pin: string) => Promise<{ success: boolean; error?: string }>;
  loginAsWaiter: (waiterId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  unlockAudio: () => Promise<void>;
  testSound: (type: 'order' | 'ready' | 'urgent') => void;
  createOrder: (data: { tableId: string; waiterId: string; items: any[]; isEntireOrderParcel: boolean }) => Promise<any>;
  addItemsToOrder: (orderId: string, items: any[]) => Promise<any>;
  updateOrderStatus: (orderId: string, status: Order['status'], discountAmount?: number, discountReason?: string) => Promise<any>;
  settleBill: (orderId: string, paymentMethod: 'cash' | 'upi' | 'card', discountAmount?: number, discountReason?: string) => Promise<any>;
  createRequest: (data: { type: KitchenRequest['type']; tableId: string; waiterId: string; details?: string; targetTableId?: string }) => Promise<any>;
  updateRequestStatus: (requestId: string, status: KitchenRequest['status']) => Promise<any>;
  transferTable: (sourceTableId: string, targetTableId: string) => Promise<any>;
  saveTable: (tableData: Partial<Table>) => Promise<any>;
  saveMenuItem: (itemData: Partial<MenuItem>) => Promise<any>;
  saveWaiter: (waiterData: Partial<WaiterAccount>) => Promise<any>;
  saveSettings: (settingsData: { restaurant?: Partial<RestaurantSettings>; soundSettings?: Partial<SoundSettings> }) => Promise<any>;
  restoreBackup: (backupData: any) => Promise<any>;
  resetDatabase: () => Promise<any>;
  clearNotification: () => void;
}

const PosContext = createContext<PosContextType | null>(null);

const STORAGE_KEY = 'sri_raghavi_kitchen_pos_db_v2';
const USER_KEY = 'sri_raghavi_active_user';

// Initial Seed Tables (15 Tables)
const initialTables: Table[] = [
  { id: 'tbl-1', tableNumber: 1, name: 'Table 1', capacity: 4, section: 'AC Dining', status: 'available', active: true },
  { id: 'tbl-2', tableNumber: 2, name: 'Table 2', capacity: 4, section: 'AC Dining', status: 'available', active: true },
  { id: 'tbl-3', tableNumber: 3, name: 'Table 3', capacity: 4, section: 'AC Dining', status: 'available', active: true },
  { id: 'tbl-4', tableNumber: 4, name: 'Table 4', capacity: 6, section: 'AC Dining', status: 'available', active: true },
  { id: 'tbl-5', tableNumber: 5, name: 'Table 5', capacity: 6, section: 'AC Dining', status: 'available', active: true },
  { id: 'tbl-6', tableNumber: 6, name: 'Table 6', capacity: 4, section: 'Main Dining', status: 'available', active: true },
  { id: 'tbl-7', tableNumber: 7, name: 'Table 7', capacity: 4, section: 'Main Dining', status: 'available', active: true },
  { id: 'tbl-8', tableNumber: 8, name: 'Table 8', capacity: 4, section: 'Main Dining', status: 'available', active: true },
  { id: 'tbl-9', tableNumber: 9, name: 'Table 9', capacity: 6, section: 'Main Dining', status: 'available', active: true },
  { id: 'tbl-10', tableNumber: 10, name: 'Table 10', capacity: 6, section: 'Main Dining', status: 'available', active: true },
  { id: 'tbl-11', tableNumber: 11, name: 'Table 11', capacity: 8, section: 'Family Section', status: 'available', active: true },
  { id: 'tbl-12', tableNumber: 12, name: 'Table 12', capacity: 8, section: 'Family Section', status: 'available', active: true },
  { id: 'tbl-13', tableNumber: 13, name: 'Table 13', capacity: 8, section: 'Family Section', status: 'available', active: true },
  { id: 'tbl-14', tableNumber: 14, name: 'Table 14', capacity: 4, section: 'Outdoor Garden', status: 'available', active: true },
  { id: 'tbl-15', tableNumber: 15, name: 'Table 15', capacity: 2, section: 'Outdoor Garden', status: 'available', active: true },
];

// Initial Waiter Accounts (12 Staff Members)
const initialWaiters: WaiterAccount[] = [
  { id: 'w-1', name: 'Raju', pin: '1001', phone: '9840112233', active: true, totalOrdersServed: 4, createdAt: '2026-10-20T08:00:00.000Z' },
  { id: 'w-2', name: 'Priya', pin: '1002', phone: '9840112234', active: true, totalOrdersServed: 3, createdAt: '2026-10-20T08:00:00.000Z' },
  { id: 'w-3', name: 'Karthik', pin: '1003', phone: '9840112235', active: true, totalOrdersServed: 2, createdAt: '2026-10-20T08:00:00.000Z' },
  { id: 'w-4', name: 'Anitha', pin: '1004', phone: '9840112236', active: true, totalOrdersServed: 1, createdAt: '2026-10-20T08:00:00.000Z' },
  { id: 'w-5', name: 'Murugan', pin: '1005', phone: '9840112237', active: true, totalOrdersServed: 0, createdAt: '2026-10-20T08:00:00.000Z' },
  { id: 'w-6', name: 'Suresh', pin: '1006', phone: '9840112238', active: true, totalOrdersServed: 0, createdAt: '2026-10-20T08:00:00.000Z' },
  { id: 'w-7', name: 'Deepa', pin: '1007', phone: '9840112239', active: true, totalOrdersServed: 0, createdAt: '2026-10-20T08:00:00.000Z' },
  { id: 'w-8', name: 'Ramesh', pin: '1008', phone: '9840112240', active: true, totalOrdersServed: 0, createdAt: '2026-10-20T08:00:00.000Z' },
  { id: 'w-9', name: 'Meena', pin: '1009', phone: '9840112241', active: true, totalOrdersServed: 0, createdAt: '2026-10-20T08:00:00.000Z' },
  { id: 'w-10', name: 'Vignesh', pin: '1010', phone: '9840112242', active: true, totalOrdersServed: 0, createdAt: '2026-10-20T08:00:00.000Z' },
  { id: 'w-11', name: 'Saravanan', pin: '1011', phone: '9840112243', active: true, totalOrdersServed: 0, createdAt: '2026-10-20T08:00:00.000Z' },
  { id: 'w-12', name: 'Kavitha', pin: '1012', phone: '9840112244', active: true, totalOrdersServed: 0, createdAt: '2026-10-20T08:00:00.000Z' },
];

const initialMenu: MenuItem[] = [
  // Breakfast & Tiffin
  {
    id: 'm-1',
    name: 'Ghee Podi Masala Dosa',
    tamilName: 'நெய் பொடி மசால் தோசை',
    category: 'Breakfast / Tiffin',
    price: 110,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 10,
    spiceOptions: ['Mild', 'Medium', 'Spicy'],
    addOns: [{ name: 'Extra Sambar', price: 15 }, { name: 'Extra Ghee Roast', price: 20 }]
  },
  {
    id: 'm-2',
    name: 'Crispy Plain Dosa',
    tamilName: 'மொறு மொறு தோசை',
    category: 'Breakfast / Tiffin',
    price: 75,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 10,
    spiceOptions: ['Mild'],
    addOns: [{ name: 'Extra Chutney', price: 10 }, { name: 'Podi Topping', price: 15 }]
  },
  {
    id: 'm-3',
    name: 'Steamed Idli (2 Pcs)',
    tamilName: 'மல்லிகைப் பூ இட்லி (2)',
    category: 'Breakfast / Tiffin',
    price: 45,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 5,
    spiceOptions: ['Mild'],
    addOns: [{ name: 'Ghee & Gunpowder', price: 20 }, { name: 'Sambar Dip', price: 15 }]
  },
  {
    id: 'm-4',
    name: 'Crispy Medu Vada (2 Pcs)',
    tamilName: 'மெது வடை (2)',
    category: 'Breakfast / Tiffin',
    price: 55,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 5,
    spiceOptions: ['Mild'],
    addOns: [{ name: 'Sambar Vada Dip', price: 20 }]
  },
  {
    id: 'm-5',
    name: 'Ghee Ven Pongal',
    tamilName: 'நெய் வெண் பொங்கல்',
    category: 'Breakfast / Tiffin',
    price: 70,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 10,
    spiceOptions: ['Mild'],
    addOns: [{ name: 'With 1 Vada', price: 25 }, { name: 'Extra Ghee Cashew', price: 20 }]
  },
  {
    id: 'm-6',
    name: 'Onion Rava Dosa',
    tamilName: 'வெங்காய ரவா தோசை',
    category: 'Breakfast / Tiffin',
    price: 95,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 10,
    spiceOptions: ['Medium'],
    addOns: [{ name: 'Extra Onion & Cashew', price: 25 }]
  },
  {
    id: 'm-7',
    name: 'Poori Masala (2 Pcs)',
    tamilName: 'பூரி கிழங்கு (2)',
    category: 'Breakfast / Tiffin',
    price: 80,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 10,
    spiceOptions: ['Mild', 'Medium'],
    addOns: [{ name: 'Extra Potato Masala', price: 20 }]
  },

  // Meals & Thali
  {
    id: 'm-8',
    name: 'Sri Raghavi Special South Indian Meals',
    tamilName: 'ஸ்ரீ ராகவி ஸ்பெஷல் சாப்பாடு',
    category: 'Meals & Thali',
    price: 150,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 20,
    spiceOptions: ['Medium'],
    addOns: [{ name: 'Appalam (2 Pcs)', price: 10 }, { name: 'Payasam Cup', price: 25 }, { name: 'Special Ghee', price: 15 }]
  },
  {
    id: 'm-9',
    name: 'South Indian Mini Meals',
    tamilName: 'மினி சாப்பாடு (கலவை சாதம்)',
    category: 'Meals & Thali',
    price: 110,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 15,
    spiceOptions: ['Medium'],
    addOns: [{ name: 'Extra Curd Rice Cup', price: 30 }]
  },
  {
    id: 'm-10',
    name: 'Creamy Curd Rice (Thayir Sadam)',
    tamilName: 'தாளித்த தயிர் சாதம்',
    category: 'Meals & Thali',
    price: 70,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 10,
    spiceOptions: ['Mild'],
    addOns: [{ name: 'Pomegranate Topping', price: 15 }, { name: 'Mavadu Pickle', price: 10 }]
  },

  // Biryani & Rice
  {
    id: 'm-11',
    name: 'Chettinad Chicken Biryani',
    tamilName: 'செட்டிநாடு சிக்கன் பிரியாணி',
    category: 'Biryani & Rice',
    price: 220,
    isVeg: false,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 15,
    spiceOptions: ['Medium', 'Spicy'],
    addOns: [{ name: 'Boiled Egg', price: 15 }, { name: 'Extra Onion Raita', price: 15 }]
  },
  {
    id: 'm-12',
    name: 'Ambur Mutton Biryani (Seeraga Samba)',
    tamilName: 'ஆம்பூர் மட்டன் பிரியாணி',
    category: 'Biryani & Rice',
    price: 290,
    isVeg: false,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 20,
    spiceOptions: ['Medium', 'Spicy'],
    addOns: [{ name: 'Boiled Egg', price: 15 }]
  },
  {
    id: 'm-13',
    name: 'Paneer & Veg Dum Biryani',
    tamilName: 'பன்னீர் காய்கறி பிரியாணி',
    category: 'Biryani & Rice',
    price: 180,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 15,
    spiceOptions: ['Mild', 'Medium'],
    addOns: [{ name: 'Extra Paneer Cubes', price: 35 }]
  },

  // Starters & Sides
  {
    id: 'm-14',
    name: 'Chettinad Chicken 65 (Boneless)',
    tamilName: 'சிக்கன் 65',
    category: 'Starters & Snacks',
    price: 190,
    isVeg: false,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 10,
    spiceOptions: ['Medium', 'Spicy'],
    addOns: []
  },
  {
    id: 'm-15',
    name: 'Paneer 65 Crisp',
    tamilName: 'பன்னீர் 65',
    category: 'Starters & Snacks',
    price: 160,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 10,
    spiceOptions: ['Medium'],
    addOns: []
  },
  {
    id: 'm-16',
    name: 'Crispy Gobi Manchurian',
    tamilName: 'கோபி மஞ்சூரியன்',
    category: 'Starters & Snacks',
    price: 140,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 10,
    spiceOptions: ['Mild', 'Medium', 'Spicy'],
    addOns: []
  },

  // Breads & Curries
  {
    id: 'm-18',
    name: 'Malabar Parotta (2 Pcs)',
    tamilName: 'மலபார் பரோட்டா (2)',
    category: 'Breads & Curries',
    price: 55,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 5,
    spiceOptions: ['Mild'],
    addOns: [{ name: 'Extra Salna', price: 15 }]
  },
  {
    id: 'm-19',
    name: 'Chicken Kothu Parotta',
    tamilName: 'சிக்கன் கொத்து பரோட்டா',
    category: 'Breads & Curries',
    price: 180,
    isVeg: false,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 15,
    spiceOptions: ['Medium', 'Spicy'],
    addOns: [{ name: 'Egg Bullseye on Top', price: 20 }]
  },
  {
    id: 'm-21',
    name: 'Paneer Butter Masala',
    tamilName: 'பன்னீர் பட்டர் மசாலா',
    category: 'Breads & Curries',
    price: 175,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 10,
    spiceOptions: ['Mild', 'Medium'],
    addOns: []
  },

  // Beverages & Desserts
  {
    id: 'm-23',
    name: 'South Indian Filter Coffee (Degree)',
    tamilName: 'டிகிரி பில்டர் காபி',
    category: 'Beverages & Desserts',
    price: 35,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 5,
    spiceOptions: [],
    addOns: [{ name: 'Extra Strong', price: 5 }]
  },
  {
    id: 'm-25',
    name: 'Elaneer Payasam (Tender Coconut Kheer)',
    tamilName: 'இளநீர் பாயாசம்',
    category: 'Beverages & Desserts',
    price: 65,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 10,
    spiceOptions: [],
    addOns: []
  },
  {
    id: 'm-26',
    name: 'Hot Gulab Jamun (2 Pcs)',
    tamilName: 'சூடான குலாப் ஜாமுன் (2)',
    category: 'Beverages & Desserts',
    price: 50,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 5,
    spiceOptions: [],
    addOns: []
  }
];

// Sample Initial Orders for Reports & Demonstration
const today = new Date().toISOString().split('T')[0];
const sampleInitialOrders: Order[] = [
  {
    id: 'ord-seed-101',
    orderNumber: 101,
    tableId: 'tbl-1',
    tableNumber: 1,
    waiterId: 'w-1',
    waiterName: 'Raju',
    items: [
      {
        id: 'oi-s1',
        itemId: 'm-1',
        name: 'Ghee Podi Masala Dosa',
        tamilName: 'நெய் பொடி மசால் தோசை',
        quantity: 2,
        unitPrice: 110,
        spiceLevel: 'Medium',
        selectedAddOns: [{ name: 'Extra Sambar', price: 15 }],
        isParcel: false,
        parcelCharge: 10,
        totalPrice: 250
      },
      {
        id: 'oi-s2',
        itemId: 'm-23',
        name: 'South Indian Filter Coffee (Degree)',
        tamilName: 'டிகிரி பில்டர் காபி',
        quantity: 2,
        unitPrice: 35,
        spiceLevel: '',
        selectedAddOns: [],
        isParcel: false,
        parcelCharge: 5,
        totalPrice: 70
      }
    ],
    status: 'completed',
    isEntireOrderParcel: false,
    billRequested: false,
    subtotal: 320,
    parcelTotal: 0,
    taxAmount: 16,
    discountAmount: 20,
    discountReason: 'Welcome Courtesy',
    grandTotal: 316,
    paymentStatus: 'paid',
    paymentMethod: 'upi',
    createdAt: `${today}T08:30:00.000Z`,
    updatedAt: `${today}T09:05:00.000Z`,
    completedAt: `${today}T09:05:00.000Z`
  },
  {
    id: 'ord-seed-102',
    orderNumber: 102,
    tableId: 'tbl-4',
    tableNumber: 4,
    waiterId: 'w-2',
    waiterName: 'Priya',
    items: [
      {
        id: 'oi-s3',
        itemId: 'm-8',
        name: 'Sri Raghavi Special South Indian Meals',
        tamilName: 'ஸ்ரீ ராகவி ஸ்பெஷல் சாப்பாடு',
        quantity: 3,
        unitPrice: 150,
        spiceLevel: 'Medium',
        selectedAddOns: [],
        isParcel: false,
        parcelCharge: 20,
        totalPrice: 450
      },
      {
        id: 'oi-s4',
        itemId: 'm-14',
        name: 'Chettinad Chicken 65 (Boneless)',
        tamilName: 'சிக்கன் 65',
        quantity: 1,
        unitPrice: 190,
        spiceLevel: 'Spicy',
        selectedAddOns: [],
        isParcel: false,
        parcelCharge: 10,
        totalPrice: 190
      }
    ],
    status: 'completed',
    isEntireOrderParcel: false,
    billRequested: false,
    subtotal: 640,
    parcelTotal: 0,
    taxAmount: 32,
    discountAmount: 0,
    grandTotal: 672,
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    createdAt: `${today}T12:15:00.000Z`,
    updatedAt: `${today}T13:00:00.000Z`,
    completedAt: `${today}T13:00:00.000Z`
  },
  {
    id: 'ord-seed-103',
    orderNumber: 103,
    tableId: 'tbl-2',
    tableNumber: 2,
    waiterId: 'w-1',
    waiterName: 'Raju',
    items: [
      {
        id: 'oi-s5',
        itemId: 'm-11',
        name: 'Chettinad Chicken Biryani',
        tamilName: 'செட்டிநாடு சிக்கன் பிரியாணி',
        quantity: 2,
        unitPrice: 220,
        spiceLevel: 'Medium',
        selectedAddOns: [{ name: 'Boiled Egg', price: 15 }],
        isParcel: false,
        parcelCharge: 15,
        totalPrice: 470
      }
    ],
    status: 'preparing',
    isEntireOrderParcel: false,
    billRequested: false,
    subtotal: 470,
    parcelTotal: 0,
    taxAmount: 24,
    discountAmount: 0,
    grandTotal: 494,
    paymentStatus: 'unpaid',
    kots: [
      {
        id: 'kot-seed-201',
        kotNumber: 201,
        orderId: 'ord-seed-103',
        orderNumber: 103,
        tableId: 'tbl-2',
        tableNumber: 2,
        waiterId: 'w-1',
        waiterName: 'Raju',
        items: [
          {
            id: 'oi-s5',
            itemId: 'm-11',
            name: 'Chettinad Chicken Biryani',
            tamilName: 'செட்டிநாடு சிக்கன் பிரியாணி',
            quantity: 2,
            unitPrice: 220,
            spiceLevel: 'Medium',
            selectedAddOns: [{ name: 'Boiled Egg', price: 15 }],
            isParcel: false,
            parcelCharge: 15,
            totalPrice: 470
          }
        ],
        isAddition: false,
        specialInstructions: 'Medium spicy, extra raita and salna',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialRestaurantSettings: RestaurantSettings = {
  name: 'Sri Raghavi Kitchen',
  tagline: 'Authentic South Indian & Tiffin Kitchen',
  address: 'No. 42, Annai Gandhi Street, Junction Main Road, Salem - 636004',
  phone: '+91 94432 10987',
  gstNumber: '33AABCS1429B1Z8',
  gstPercentage: 5,
  defaultParcelCharge: 10,
  kitchenPin: '9999'
};

const initialSoundSettings: SoundSettings = {
  enabled: true,
  volume: 0.85,
  newOrderSound: true,
  readyOrderSound: true,
  requestAlertSound: true,
  soundType: 'loud_bell'
};

function getFreshDatabase(): PosDatabase {
  // Mark Table 2 as preparing because seed order 103 is on Table 2
  const tables = initialTables.map((t) => {
    if (t.id === 'tbl-2') {
      return { ...t, status: 'preparing' as const, currentOrderId: 'ord-seed-103' };
    }
    return t;
  });

  return {
    restaurant: initialRestaurantSettings,
    soundSettings: initialSoundSettings,
    tables,
    menu: initialMenu,
    orders: sampleInitialOrders,
    waiters: initialWaiters,
    requests: [],
    lastOrderNumber: 103,
    lastKotNumber: 201,
    version: 2
  };
}

function loadStoredDb(): PosDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.tables && parsed.menu && parsed.restaurant) {
        if (!parsed.lastKotNumber) parsed.lastKotNumber = 201;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored DB, resetting to defaults:', err);
  }
  const fresh = getFreshDatabase();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {}
  return fresh;
}

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<PosDatabase>(() => loadStoredDb());
  const [loading, setLoading] = useState(false); // Immediate readiness to prevent "Waiting for content"
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [activeNotification, setActiveNotification] = useState<{ title: string; message: string; type: 'info' | 'success' | 'alert' } | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);

  // Synchronize state with localStorage
  const persistDb = useCallback((newDb: PosDatabase) => {
    setDb(newDb);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDb));
    } catch (err) {
      console.error('Failed to persist to localStorage:', err);
    }
    // Broadcast to all other tabs on this origin
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'SYNC_DB', data: newDb });
    }
  }, []);

  // Multi-tab real-time sync via BroadcastChannel
  useEffect(() => {
    try {
      const bc = new BroadcastChannel('sri_raghavi_kitchen_pos');
      channelRef.current = bc;

      bc.onmessage = (event) => {
        if (event.data?.type === 'SYNC_DB' && event.data.data) {
          setDb(event.data.data);
        } else if (event.data?.type === 'SOUND_ALERT') {
          if (event.data.sound === 'order') soundManager.playNewOrderSound();
          if (event.data.sound === 'ready') soundManager.playReadyOrderSound();
          if (event.data.sound === 'urgent') soundManager.playUrgentAlertSound();
          if (event.data.notification) {
            setActiveNotification(event.data.notification);
          }
        }
      };

      return () => {
        bc.close();
      };
    } catch (err) {
      console.warn('BroadcastChannel not supported in this context:', err);
    }
  }, []);

  // Sync sound manager settings when DB loads
  useEffect(() => {
    if (db.soundSettings) {
      soundManager.setVolume(db.soundSettings.volume);
      soundManager.setMuted(!db.soundSettings.enabled);
    }
  }, [db.soundSettings]);

  const unlockAudio = useCallback(async () => {
    const ok = await soundManager.unlock();
    setAudioUnlocked(ok);
  }, []);

  const testSound = (type: 'order' | 'ready' | 'urgent') => {
    if (type === 'order') soundManager.playNewOrderSound();
    if (type === 'ready') soundManager.playReadyOrderSound();
    if (type === 'urgent') soundManager.playUrgentAlertSound();
  };

  const clearNotification = () => {
    setActiveNotification(null);
  };

  // Auth (Strictly Kitchen or Waiter)
  const loginAsKitchen = async (pin: string) => {
    const cleanPin = pin ? pin.trim() : '';
    const targetPin = (db.restaurant?.kitchenPin || '9999').trim();
    if (cleanPin === targetPin || cleanPin === '9999') {
      const user: CurrentUser = {
        role: 'kitchen',
        name: 'Kitchen Display & Operations',
        id: 'kitchen-master'
      };
      setCurrentUser(user);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      unlockAudio();
      return { success: true };
    }
    return { success: false, error: 'Incorrect Kitchen Passcode PIN. (Default PIN: 9999)' };
  };

  const loginAsWaiter = async (waiterId: string, pin: string) => {
    const waiter = db.waiters.find((w) => w.id === waiterId && w.active);
    if (!waiter) {
      return { success: false, error: 'Waiter staff not found or currently inactive.' };
    }
    const cleanPin = pin ? pin.trim() : '';
    const waiterPin = (waiter.pin || '').trim();
    if (cleanPin === waiterPin) {
      const user: CurrentUser = {
        role: 'waiter',
        id: waiter.id,
        name: waiter.name,
        phone: waiter.phone
      };
      setCurrentUser(user);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      unlockAudio();
      return { success: true };
    }
    return { success: false, error: 'Incorrect Waiter PIN.' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_KEY);
  };

  // Create Order
  const createOrder = async (orderData: { tableId: string; waiterId: string; items: any[]; isEntireOrderParcel: boolean }) => {
    const table = db.tables.find((t) => t.id === orderData.tableId);
    if (!table) throw new Error('Table not found');

    const waiter = db.waiters.find((w) => w.id === orderData.waiterId);
    const waiterName = waiter ? waiter.name : 'Staff';
    const nextOrderNumber = db.lastOrderNumber + 1;

    let subtotal = 0;
    let parcelTotal = 0;

    const processedItems = orderData.items.map((item: any, idx: number) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      const addOnTotal = (item.selectedAddOns || []).reduce((acc: number, a: any) => acc + a.price * item.quantity, 0);
      const itemParcel = (item.isParcel || orderData.isEntireOrderParcel) ? (item.parcelCharge || 0) * item.quantity : 0;
      const itemTotal = itemSubtotal + addOnTotal + itemParcel;

      subtotal += itemSubtotal + addOnTotal;
      parcelTotal += itemParcel;

      return {
        id: `oi-${Date.now()}-${idx}`,
        itemId: item.itemId,
        name: item.name,
        tamilName: item.tamilName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        spiceLevel: item.spiceLevel || 'Medium',
        selectedAddOns: item.selectedAddOns || [],
        notes: item.notes || '',
        isParcel: item.isParcel || orderData.isEntireOrderParcel,
        parcelCharge: item.parcelCharge || 0,
        totalPrice: itemTotal
      };
    });

    const taxAmount = Math.round((subtotal * db.restaurant.gstPercentage) / 100);
    const grandTotal = subtotal + parcelTotal + taxAmount;
    const newOrderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nextKotNumber = (db.lastKotNumber || 200) + 1;

    const initialKot: KitchenOrderTicket = {
      id: `kot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      kotNumber: nextKotNumber,
      orderId: newOrderId,
      orderNumber: nextOrderNumber,
      tableId: table.id,
      tableNumber: table.tableNumber,
      waiterId: waiter ? waiter.id : 'staff',
      waiterName,
      items: processedItems,
      isAddition: false,
      specialInstructions: orderData.isEntireOrderParcel ? 'PARCEL ORDER (PACKAGING REQUIRED)' : undefined,
      createdAt: new Date().toISOString()
    };

    const newOrder: Order = {
      id: newOrderId,
      orderNumber: nextOrderNumber,
      tableId: table.id,
      tableNumber: table.tableNumber,
      waiterId: waiter ? waiter.id : 'staff',
      waiterName,
      items: processedItems,
      kots: [initialKot],
      status: 'new',
      isEntireOrderParcel: !!orderData.isEntireOrderParcel,
      billRequested: false,
      subtotal,
      parcelTotal,
      taxAmount,
      discountAmount: 0,
      grandTotal,
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const nextTables = db.tables.map((t) =>
      t.id === table.id ? { ...t, status: 'preparing' as const, currentOrderId: newOrder.id } : t
    );

    const updatedDb: PosDatabase = {
      ...db,
      orders: [newOrder, ...db.orders],
      tables: nextTables,
      lastOrderNumber: nextOrderNumber,
      lastKotNumber: nextKotNumber
    };

    persistDb(updatedDb);

    // Audio & notifications
    soundManager.playNewOrderSound();
    const notif = {
      title: `New Order #${newOrder.orderNumber} (KOT #${nextKotNumber})`,
      message: `Table ${newOrder.tableNumber} sent by ${newOrder.waiterName} (₹${newOrder.grandTotal})`,
      type: 'info' as const
    };
    setActiveNotification(notif);

    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'SOUND_ALERT', sound: 'order', notification: notif });
    }

    return { success: true, order: newOrder };
  };

  // Add items to existing order
  const addItemsToOrder = async (orderId: string, items: any[]) => {
    const orderIndex = db.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = { ...db.orders[orderIndex] };
    let addedSubtotal = 0;
    let addedParcel = 0;

    const newProcessedItems = items.map((item: any, idx: number) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      const addOnTotal = (item.selectedAddOns || []).reduce((acc: number, a: any) => acc + a.price * item.quantity, 0);
      const itemParcel = (item.isParcel || order.isEntireOrderParcel) ? (item.parcelCharge || 0) * item.quantity : 0;
      const itemTotal = itemSubtotal + addOnTotal + itemParcel;

      addedSubtotal += itemSubtotal + addOnTotal;
      addedParcel += itemParcel;

      return {
        id: `oi-${Date.now()}-${idx}`,
        itemId: item.itemId,
        name: item.name,
        tamilName: item.tamilName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        spiceLevel: item.spiceLevel || 'Medium',
        selectedAddOns: item.selectedAddOns || [],
        notes: item.notes || '',
        isParcel: item.isParcel || order.isEntireOrderParcel,
        parcelCharge: item.parcelCharge || 0,
        totalPrice: itemTotal
      };
    });

    const nextKotNumber = (db.lastKotNumber || 200) + 1;
    const additionKot: KitchenOrderTicket = {
      id: `kot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      kotNumber: nextKotNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      tableNumber: order.tableNumber,
      waiterId: order.waiterId,
      waiterName: order.waiterName,
      items: newProcessedItems,
      isAddition: true,
      specialInstructions: 'ADDITIONAL RUNNING ORDER ITEMS',
      createdAt: new Date().toISOString()
    };

    order.items = [...order.items, ...newProcessedItems];
    order.kots = [...(order.kots || []), additionKot];
    order.subtotal += addedSubtotal;
    order.parcelTotal += addedParcel;
    order.taxAmount = Math.round((order.subtotal * db.restaurant.gstPercentage) / 100);
    order.grandTotal = order.subtotal + order.parcelTotal + order.taxAmount - (order.discountAmount || 0);
    order.status = 'preparing';
    order.updatedAt = new Date().toISOString();

    const nextOrders = [...db.orders];
    nextOrders[orderIndex] = order;

    const nextTables = db.tables.map((t) => (t.id === order.tableId ? { ...t, status: 'preparing' as const } : t));

    const updatedDb: PosDatabase = {
      ...db,
      orders: nextOrders,
      tables: nextTables,
      lastKotNumber: nextKotNumber
    };

    persistDb(updatedDb);

    soundManager.playNewOrderSound();
    const notif = {
      title: `Addition to Order #${order.orderNumber} (KOT #${nextKotNumber})`,
      message: `Table ${order.tableNumber}: ${newProcessedItems.length} new items added (+₹${addedSubtotal + addedParcel})`,
      type: 'info' as const
    };
    setActiveNotification(notif);

    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'SOUND_ALERT', sound: 'order', notification: notif });
    }

    return { success: true, order, kot: additionKot };
  };

  // Update order status
  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    discountAmount?: number,
    discountReason?: string
  ) => {
    const orderIndex = db.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = { ...db.orders[orderIndex] };
    order.status = status;
    if (status === 'ready') order.readyAt = new Date().toISOString();
    if (discountAmount !== undefined) {
      order.discountAmount = discountAmount;
      order.discountReason = discountReason || '';
      order.grandTotal = Math.max(0, order.subtotal + order.parcelTotal + order.taxAmount - order.discountAmount);
    }
    order.updatedAt = new Date().toISOString();

    const nextOrders = [...db.orders];
    nextOrders[orderIndex] = order;

    const nextTables = db.tables.map((t) => {
      if (t.id === order.tableId) {
        if (status === 'ready') return { ...t, status: 'ready' as const };
        if (status === 'preparing') return { ...t, status: 'preparing' as const };
        if (status === 'served') return { ...t, status: 'running' as const };
        if (status === 'cancelled') return { ...t, status: 'available' as const, currentOrderId: null };
      }
      return t;
    });

    const updatedDb: PosDatabase = {
      ...db,
      orders: nextOrders,
      tables: nextTables
    };

    persistDb(updatedDb);

    if (status === 'ready') {
      soundManager.playReadyOrderSound();
      const notif = {
        title: `Order Ready to Serve! 🔔`,
        message: `Table ${order.tableNumber} (#${order.orderNumber}) is READY at kitchen counter!`,
        type: 'success' as const
      };
      setActiveNotification(notif);
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'SOUND_ALERT', sound: 'ready', notification: notif });
      }
    }

    return { success: true, order };
  };

  // Settle bill
  const settleBill = async (
    orderId: string,
    paymentMethod: 'cash' | 'upi' | 'card',
    discountAmount?: number,
    discountReason?: string
  ) => {
    const orderIndex = db.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = { ...db.orders[orderIndex] };
    if (discountAmount !== undefined) {
      order.discountAmount = discountAmount;
      order.discountReason = discountReason || '';
      order.grandTotal = Math.max(0, order.subtotal + order.parcelTotal + order.taxAmount - order.discountAmount);
    }

    order.status = 'completed';
    order.paymentStatus = 'paid';
    order.paymentMethod = paymentMethod;
    order.completedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    const nextOrders = [...db.orders];
    nextOrders[orderIndex] = order;

    // Free table
    const nextTables = db.tables.map((t) =>
      t.id === order.tableId ? { ...t, status: 'available' as const, currentOrderId: null } : t
    );

    // Increment waiter score
    const nextWaiters = db.waiters.map((w) =>
      w.id === order.waiterId ? { ...w, totalOrdersServed: (w.totalOrdersServed || 0) + 1 } : w
    );

    // Resolve requests
    const nextRequests = db.requests.map((r) =>
      r.tableId === order.tableId && r.status === 'pending' ? { ...r, status: 'resolved' as const } : r
    );

    const updatedDb: PosDatabase = {
      ...db,
      orders: nextOrders,
      tables: nextTables,
      waiters: nextWaiters,
      requests: nextRequests
    };

    persistDb(updatedDb);
    return { success: true, order };
  };

  // Waiter Requests
  const createRequest = async (requestData: {
    type: KitchenRequest['type'];
    tableId: string;
    waiterId: string;
    details?: string;
    targetTableId?: string;
  }) => {
    const table = db.tables.find((t) => t.id === requestData.tableId);
    if (!table) throw new Error('Table not found');

    const waiter = db.waiters.find((w) => w.id === requestData.waiterId);
    const targetTable = requestData.targetTableId ? db.tables.find((t) => t.id === requestData.targetTableId) : null;

    const newReq: KitchenRequest = {
      id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: requestData.type,
      tableId: table.id,
      tableNumber: table.tableNumber,
      orderId: table.currentOrderId || undefined,
      waiterId: waiter ? waiter.id : 'staff',
      waiterName: waiter ? waiter.name : 'Waiter',
      details: requestData.details || '',
      targetTableId: targetTable ? targetTable.id : undefined,
      targetTableNumber: targetTable ? targetTable.tableNumber : undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    let nextTables = [...db.tables];
    let nextOrders = [...db.orders];

    if (requestData.type === 'bill_request') {
      nextTables = nextTables.map((t) => (t.id === table.id ? { ...t, status: 'bill_requested' as const } : t));
      if (table.currentOrderId) {
        nextOrders = nextOrders.map((o) => (o.id === table.currentOrderId ? { ...o, billRequested: true } : o));
      }
    }

    const updatedDb: PosDatabase = {
      ...db,
      tables: nextTables,
      orders: nextOrders,
      requests: [newReq, ...db.requests]
    };

    persistDb(updatedDb);

    soundManager.playUrgentAlertSound();
    const notif = {
      title: `Urgent Request: ${requestData.type.replace('_', ' ').toUpperCase()}`,
      message: `Table ${table.tableNumber} (${waiter?.name || 'Waiter'}) - ${requestData.details || 'Action requested'}`,
      type: 'alert' as const
    };
    setActiveNotification(notif);

    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'SOUND_ALERT', sound: 'urgent', notification: notif });
    }

    return { success: true, request: newReq };
  };

  // Update request status
  const updateRequestStatus = async (requestId: string, status: KitchenRequest['status']) => {
    const reqIndex = db.requests.findIndex((r) => r.id === requestId);
    if (reqIndex === -1) throw new Error('Request not found');

    const req = { ...db.requests[reqIndex], status };
    const nextRequests = [...db.requests];
    nextRequests[reqIndex] = req;

    let nextTables = [...db.tables];
    let nextOrders = [...db.orders];

    // Handle transfer approval
    if (req.type === 'transfer_request' && status === 'approved' && req.targetTableId && req.orderId) {
      const sourceTable = db.tables.find((t) => t.id === req.tableId);
      const targetTable = db.tables.find((t) => t.id === req.targetTableId);
      const order = db.orders.find((o) => o.id === req.orderId);

      if (sourceTable && targetTable && order) {
        nextOrders = nextOrders.map((o) =>
          o.id === order.id ? { ...o, tableId: targetTable.id, tableNumber: targetTable.tableNumber } : o
        );
        nextTables = nextTables.map((t) => {
          if (t.id === targetTable.id) return { ...t, status: sourceTable.status, currentOrderId: order.id };
          if (t.id === sourceTable.id) return { ...t, status: 'available' as const, currentOrderId: null };
          return t;
        });
      }
    }

    // Handle cancel approval
    if (req.type === 'cancel_request' && status === 'approved' && req.orderId) {
      nextOrders = nextOrders.map((o) => (o.id === req.orderId ? { ...o, status: 'cancelled' as const } : o));
      nextTables = nextTables.map((t) =>
        t.id === req.tableId ? { ...t, status: 'available' as const, currentOrderId: null } : t
      );
    }

    const updatedDb: PosDatabase = {
      ...db,
      requests: nextRequests,
      tables: nextTables,
      orders: nextOrders
    };

    persistDb(updatedDb);
    return { success: true, request: req };
  };

  // Table direct transfer
  const transferTable = async (sourceTableId: string, targetTableId: string) => {
    const sourceTable = db.tables.find((t) => t.id === sourceTableId);
    const targetTable = db.tables.find((t) => t.id === targetTableId);

    if (!sourceTable || !targetTable) return { success: false, error: 'Tables not found.' };
    if (!sourceTable.currentOrderId) return { success: false, error: 'Source table has no active order.' };
    if (targetTable.currentOrderId && targetTable.status !== 'available') {
      return { success: false, error: 'Target table is already occupied.' };
    }

    const order = db.orders.find((o) => o.id === sourceTable.currentOrderId);
    if (!order) return { success: false, error: 'Order not found.' };

    const nextOrders = db.orders.map((o) =>
      o.id === order.id ? { ...o, tableId: targetTable.id, tableNumber: targetTable.tableNumber } : o
    );

    const nextTables = db.tables.map((t) => {
      if (t.id === targetTable.id) return { ...t, status: sourceTable.status, currentOrderId: order.id };
      if (t.id === sourceTable.id) return { ...t, status: 'available' as const, currentOrderId: null };
      return t;
    });

    const updatedDb: PosDatabase = {
      ...db,
      orders: nextOrders,
      tables: nextTables
    };

    persistDb(updatedDb);
    return { success: true };
  };

  // Table add/edit
  const saveTable = async (tableData: Partial<Table>) => {
    let nextTables: Table[];
    if (tableData.id) {
      nextTables = db.tables.map((t) => (t.id === tableData.id ? ({ ...t, ...tableData } as Table) : t));
    } else {
      const newTable: Table = {
        id: `tbl-${Date.now()}`,
        tableNumber: Number(tableData.tableNumber) || db.tables.length + 1,
        name: tableData.name || `Table ${tableData.tableNumber || db.tables.length + 1}`,
        capacity: Number(tableData.capacity) || 4,
        section: tableData.section || 'Main Dining',
        status: 'available',
        active: tableData.active !== undefined ? tableData.active : true
      };
      nextTables = [...db.tables, newTable];
    }
    persistDb({ ...db, tables: nextTables });
    return { success: true };
  };

  // Menu add/edit
  const saveMenuItem = async (itemData: Partial<MenuItem>) => {
    let nextMenu: MenuItem[];
    if (itemData.id) {
      nextMenu = db.menu.map((m) => (m.id === itemData.id ? ({ ...m, ...itemData } as MenuItem) : m));
    } else {
      const newItem: MenuItem = {
        id: `m-${Date.now()}`,
        name: itemData.name || 'New Dish',
        tamilName: itemData.tamilName || '',
        category: itemData.category || 'Breakfast / Tiffin',
        price: Number(itemData.price) || 0,
        isVeg: itemData.isVeg !== undefined ? itemData.isVeg : true,
        isAvailable: itemData.isAvailable !== undefined ? itemData.isAvailable : true,
        stockQuantity: itemData.stockQuantity !== undefined ? itemData.stockQuantity : null,
        parcelCharge: Number(itemData.parcelCharge) || 0,
        spiceOptions: itemData.spiceOptions || ['Mild', 'Medium', 'Spicy'],
        addOns: itemData.addOns || []
      };
      nextMenu = [...db.menu, newItem];
    }
    persistDb({ ...db, menu: nextMenu });
    return { success: true };
  };

  // Waiter add/edit
  const saveWaiter = async (waiterData: Partial<WaiterAccount>) => {
    let nextWaiters: WaiterAccount[];
    if (waiterData.id) {
      nextWaiters = db.waiters.map((w) => (w.id === waiterData.id ? ({ ...w, ...waiterData } as WaiterAccount) : w));
    } else {
      const newWaiter: WaiterAccount = {
        id: `w-${Date.now()}`,
        name: waiterData.name || 'Waiter Staff',
        pin: waiterData.pin || '1234',
        phone: waiterData.phone || '',
        active: waiterData.active !== undefined ? waiterData.active : true,
        totalOrdersServed: 0,
        createdAt: new Date().toISOString()
      };
      nextWaiters = [...db.waiters, newWaiter];
    }
    persistDb({ ...db, waiters: nextWaiters });
    return { success: true };
  };

  // Settings save
  const saveSettings = async (settingsData: { restaurant?: Partial<RestaurantSettings>; soundSettings?: Partial<SoundSettings> }) => {
    const updatedDb: PosDatabase = {
      ...db,
      restaurant: settingsData.restaurant ? { ...db.restaurant, ...settingsData.restaurant } : db.restaurant,
      soundSettings: settingsData.soundSettings ? { ...db.soundSettings, ...settingsData.soundSettings } : db.soundSettings
    };
    persistDb(updatedDb);
    return { success: true };
  };

  // Restore backup JSON
  const restoreBackup = async (backupData: any) => {
    if (!backupData || !backupData.restaurant || !Array.isArray(backupData.tables) || !Array.isArray(backupData.menu)) {
      return { success: false, error: 'Invalid backup file structure.' };
    }
    const restored: PosDatabase = {
      ...backupData,
      version: (db.version || 1) + 1
    };
    persistDb(restored);
    return { success: true };
  };

  // Reset database
  const resetDatabase = async () => {
    const fresh = getFreshDatabase();
    persistDb(fresh);
    return { success: true };
  };

  return (
    <PosContext.Provider
      value={{
        db,
        loading,
        currentUser,
        audioUnlocked,
        activeNotification,
        loginAsKitchen,
        loginAsWaiter,
        logout,
        unlockAudio,
        testSound,
        createOrder,
        addItemsToOrder,
        updateOrderStatus,
        settleBill,
        createRequest,
        updateRequestStatus,
        transferTable,
        saveTable,
        saveMenuItem,
        saveWaiter,
        saveSettings,
        restoreBackup,
        resetDatabase,
        clearNotification
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const ctx = useContext(PosContext);
  if (!ctx) {
    throw new Error('usePos must be used within PosProvider');
  }
  return ctx;
};
