import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  PosDatabase,
  Order,
  KitchenRequest,
  Table,
  MenuItem,
  WaiterAccount,
  RestaurantSettings,
  SoundSettings,
  SseEvent
} from './src/types/pos.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'restaurant_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
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

const initialWaiters: WaiterAccount[] = [
  { id: 'w-1', name: 'Raju', pin: '1001', phone: '9840112233', active: true, totalOrdersServed: 0, createdAt: new Date().toISOString() },
  { id: 'w-2', name: 'Priya', pin: '1002', phone: '9840112234', active: true, totalOrdersServed: 0, createdAt: new Date().toISOString() },
  { id: 'w-3', name: 'Karthik', pin: '1003', phone: '9840112235', active: true, totalOrdersServed: 0, createdAt: new Date().toISOString() },
  { id: 'w-4', name: 'Anitha', pin: '1004', phone: '9840112236', active: true, totalOrdersServed: 0, createdAt: new Date().toISOString() },
  { id: 'w-5', name: 'Murugan', pin: '1005', phone: '9840112237', active: true, totalOrdersServed: 0, createdAt: new Date().toISOString() },
  { id: 'w-6', name: 'Suresh', pin: '1006', phone: '9840112238', active: true, totalOrdersServed: 0, createdAt: new Date().toISOString() },
  { id: 'w-7', name: 'Deepa', pin: '1007', phone: '9840112239', active: true, totalOrdersServed: 0, createdAt: new Date().toISOString() },
  { id: 'w-8', name: 'Ramesh', pin: '1008', phone: '9840112240', active: true, totalOrdersServed: 0, createdAt: new Date().toISOString() },
  { id: 'w-9', name: 'Meena', pin: '1009', phone: '9840112241', active: true, totalOrdersServed: 0, createdAt: new Date().toISOString() },
  { id: 'w-10', name: 'Vignesh', pin: '1010', phone: '9840112242', active: true, totalOrdersServed: 0, createdAt: new Date().toISOString() },
  { id: 'w-11', name: 'Saravanan', pin: '1011', phone: '9840112243', active: true, totalOrdersServed: 0, createdAt: new Date().toISOString() },
  { id: 'w-12', name: 'Kavitha', pin: '1012', phone: '9840112244', active: true, totalOrdersServed: 0, createdAt: new Date().toISOString() },
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
    addOns: [{ name: 'Boiled Egg', price: 15 }, { name: 'Extra Onion Raita', price: 15 }, { name: 'Extra Salna / Gravy', price: 20 }]
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
    addOns: [{ name: 'Boiled Egg', price: 15 }, { name: 'Brinjal Gravy (Ennai Kathirikai)', price: 20 }]
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
    addOns: [{ name: 'Extra Paneer Cubes', price: 35 }, { name: 'Raita', price: 15 }]
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
    addOns: [{ name: 'Lemon & Fried Curry Leaves', price: 10 }]
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
    addOns: [{ name: 'Mint Chutney', price: 10 }]
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
  {
    id: 'm-17',
    name: 'Pepper Chicken Chukka',
    tamilName: 'மிளகு சிக்கன் சுக்கா',
    category: 'Starters & Snacks',
    price: 210,
    isVeg: false,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 15,
    spiceOptions: ['Spicy'],
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
    id: 'm-20',
    name: 'Butter Naan (1 Pc)',
    tamilName: 'பட்டர் நான்',
    category: 'Breads & Curries',
    price: 45,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 5,
    spiceOptions: ['Mild'],
    addOns: []
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
    addOns: [{ name: 'Extra Butter Cream', price: 20 }]
  },
  {
    id: 'm-22',
    name: 'Chettinad Chicken Gravy',
    tamilName: 'செட்டிநாடு சிக்கன் குழம்பு',
    category: 'Breads & Curries',
    price: 210,
    isVeg: false,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 15,
    spiceOptions: ['Medium', 'Spicy'],
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
    addOns: [{ name: 'Extra Strong Decoction', price: 5 }, { name: 'Less Sugar', price: 0 }]
  },
  {
    id: 'm-24',
    name: 'Masala Chai / Sukku Malli Tea',
    tamilName: 'சுக்கு மல்லி காபி / மசாலா டீ',
    category: 'Beverages & Desserts',
    price: 30,
    isVeg: true,
    isAvailable: true,
    stockQuantity: null,
    parcelCharge: 5,
    spiceOptions: [],
    addOns: []
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
    addOns: [{ name: 'Vanilla Ice Cream Scoop', price: 30 }]
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

function getInitialDatabase(): PosDatabase {
  return {
    restaurant: initialRestaurantSettings,
    soundSettings: initialSoundSettings,
    tables: initialTables,
    menu: initialMenu,
    orders: [],
    waiters: initialWaiters,
    requests: [],
    lastOrderNumber: 100,
    version: 1
  };
}

// Database helper
let memoryDb: PosDatabase = getInitialDatabase();

function loadDb(): PosDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      // Validate basic shape
      if (parsed.restaurant && parsed.tables && parsed.menu) {
        memoryDb = parsed;
        return memoryDb;
      }
    }
  } catch (err) {
    console.error('Error loading database file, initializing defaults:', err);
  }
  memoryDb = getInitialDatabase();
  saveDb(memoryDb);
  return memoryDb;
}

function saveDb(data: PosDatabase) {
  memoryDb = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting database file:', err);
  }
}

// Initialize on startup
loadDb();

// SSE Clients
const sseClients = new Set<Response>();

function broadcastEvent(type: SseEvent['type'], data: any) {
  const event: SseEvent = {
    type,
    data,
    timestamp: new Date().toISOString()
  };
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
}

// Create Express App
const app = express();
app.use(express.json({ limit: '10mb' }));

// Heartbeat for SSE every 25s
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': heartbeat\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 25000);

// SSE stream
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial bootstrap
  const initEvent: SseEvent = {
    type: 'BOOTSTRAP',
    data: {
      timestamp: new Date().toISOString(),
      orderCount: memoryDb.orders.length,
      requestCount: memoryDb.requests.length
    },
    timestamp: new Date().toISOString()
  };
  res.write(`data: ${JSON.stringify(initEvent)}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// GET Bootstrap Data
app.get('/api/bootstrap', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: memoryDb
  });
});

// Authentication Endpoint (Strictly Kitchen & Waiter roles only)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { role, pin, waiterId } = req.body;

  if (role === 'kitchen') {
    if (pin === memoryDb.restaurant.kitchenPin) {
      return res.json({
        success: true,
        user: {
          role: 'kitchen',
          name: 'Kitchen Display & Operations',
          id: 'kitchen-master'
        }
      });
    }
    return res.status(401).json({ success: false, error: 'Invalid Kitchen PIN code.' });
  }

  if (role === 'waiter') {
    const waiter = memoryDb.waiters.find((w) => w.id === waiterId && w.active);
    if (!waiter) {
      return res.status(404).json({ success: false, error: 'Waiter account not found or inactive.' });
    }
    if (waiter.pin === pin) {
      return res.json({
        success: true,
        user: {
          role: 'waiter',
          id: waiter.id,
          name: waiter.name,
          phone: waiter.phone
        }
      });
    }
    return res.status(401).json({ success: false, error: 'Incorrect Waiter PIN.' });
  }

  return res.status(400).json({ success: false, error: 'Invalid role requested.' });
});

// Create Order (Waiter creates, Kitchen gets live alert)
app.post('/api/orders', (req: Request, res: Response) => {
  const { tableId, waiterId, items, isEntireOrderParcel } = req.body;

  const table = memoryDb.tables.find((t) => t.id === tableId);
  if (!table) {
    return res.status(404).json({ success: false, error: 'Table not found.' });
  }

  const waiter = memoryDb.waiters.find((w) => w.id === waiterId);
  const waiterName = waiter ? waiter.name : 'Staff';

  memoryDb.lastOrderNumber += 1;
  const orderNumber = memoryDb.lastOrderNumber;

  let subtotal = 0;
  let parcelTotal = 0;

  const processedItems = items.map((item: any, idx: number) => {
    const itemSubtotal = item.unitPrice * item.quantity;
    const addOnTotal = (item.selectedAddOns || []).reduce((acc: number, a: any) => acc + (a.price * item.quantity), 0);
    const itemParcel = (item.isParcel || isEntireOrderParcel) ? (item.parcelCharge || 0) * item.quantity : 0;
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
      isParcel: item.isParcel || isEntireOrderParcel,
      parcelCharge: item.parcelCharge || 0,
      totalPrice: itemTotal
    };
  });

  const taxAmount = Math.round((subtotal * memoryDb.restaurant.gstPercentage) / 100);
  const grandTotal = subtotal + parcelTotal + taxAmount;

  const newOrder: Order = {
    id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderNumber,
    tableId: table.id,
    tableNumber: table.tableNumber,
    waiterId: waiterId || 'staff',
    waiterName,
    items: processedItems,
    status: 'new',
    isEntireOrderParcel: !!isEntireOrderParcel,
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

  memoryDb.orders.unshift(newOrder);

  // Update table status
  table.status = 'preparing';
  table.currentOrderId = newOrder.id;

  saveDb(memoryDb);

  broadcastEvent('ORDER_CREATED', { order: newOrder, table });
  broadcastEvent('TABLES_UPDATED', memoryDb.tables);

  res.json({ success: true, order: newOrder });
});

// Add items to existing running order
app.post('/api/orders/:id/items', (req: Request, res: Response) => {
  const { id } = req.params;
  const { items } = req.body;

  const orderIndex = memoryDb.orders.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  const order = memoryDb.orders[orderIndex];

  let addedSubtotal = 0;
  let addedParcel = 0;

  const newProcessedItems = items.map((item: any, idx: number) => {
    const itemSubtotal = item.unitPrice * item.quantity;
    const addOnTotal = (item.selectedAddOns || []).reduce((acc: number, a: any) => acc + (a.price * item.quantity), 0);
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

  order.items.push(...newProcessedItems);
  order.subtotal += addedSubtotal;
  order.parcelTotal += addedParcel;
  order.taxAmount = Math.round((order.subtotal * memoryDb.restaurant.gstPercentage) / 100);
  order.grandTotal = order.subtotal + order.parcelTotal + order.taxAmount - (order.discountAmount || 0);
  order.status = 'preparing';
  order.updatedAt = new Date().toISOString();

  // If table was ready or running, move back to preparing
  const table = memoryDb.tables.find((t) => t.id === order.tableId);
  if (table) {
    table.status = 'preparing';
  }

  saveDb(memoryDb);

  broadcastEvent('ORDER_UPDATED', { order, table });
  broadcastEvent('TABLES_UPDATED', memoryDb.tables);

  res.json({ success: true, order });
});

// Update Order Status (e.g. Preparing -> Ready -> Served)
app.patch('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, discountAmount, discountReason } = req.body;

  const orderIndex = memoryDb.orders.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  const order = memoryDb.orders[orderIndex];
  if (status) {
    order.status = status;
    if (status === 'ready') {
      order.readyAt = new Date().toISOString();
    }
  }

  if (discountAmount !== undefined) {
    order.discountAmount = Number(discountAmount) || 0;
    order.discountReason = discountReason || '';
    order.grandTotal = Math.max(0, order.subtotal + order.parcelTotal + order.taxAmount - order.discountAmount);
  }

  order.updatedAt = new Date().toISOString();

  // Update associated table status
  const table = memoryDb.tables.find((t) => t.id === order.tableId);
  if (table) {
    if (status === 'ready') {
      table.status = 'ready';
    } else if (status === 'preparing') {
      table.status = 'preparing';
    } else if (status === 'served') {
      table.status = 'running';
    } else if (status === 'cancelled') {
      table.status = 'available';
      table.currentOrderId = null;
    }
  }

  saveDb(memoryDb);

  broadcastEvent('ORDER_UPDATED', { order, table });
  broadcastEvent('TABLES_UPDATED', memoryDb.tables);

  res.json({ success: true, order });
});

// Settle and Complete Bill
app.post('/api/orders/:id/settle', (req: Request, res: Response) => {
  const { id } = req.params;
  const { paymentMethod, discountAmount, discountReason } = req.body;

  const order = memoryDb.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found.' });
  }

  if (discountAmount !== undefined) {
    order.discountAmount = Number(discountAmount) || 0;
    order.discountReason = discountReason || '';
    order.grandTotal = Math.max(0, order.subtotal + order.parcelTotal + order.taxAmount - order.discountAmount);
  }

  order.status = 'completed';
  order.paymentStatus = 'paid';
  order.paymentMethod = paymentMethod || 'cash';
  order.completedAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();

  // Increment waiter performance
  const waiter = memoryDb.waiters.find((w) => w.id === order.waiterId);
  if (waiter) {
    waiter.totalOrdersServed += 1;
  }

  // Free up table
  const table = memoryDb.tables.find((t) => t.id === order.tableId);
  if (table) {
    table.status = 'available';
    table.currentOrderId = null;
  }

  // Clear any pending requests for this table/order
  memoryDb.requests.forEach((r) => {
    if (r.tableId === order.tableId && r.status === 'pending') {
      r.status = 'resolved';
    }
  });

  saveDb(memoryDb);

  broadcastEvent('ORDER_COMPLETED', { order, table });
  broadcastEvent('TABLES_UPDATED', memoryDb.tables);
  broadcastEvent('WAITERS_UPDATED', memoryDb.waiters);
  broadcastEvent('REQUEST_UPDATED', memoryDb.requests);

  res.json({ success: true, order });
});

// Waiter Requests (Bill, Parcel, Cancel, Table Transfer, Assistance)
app.post('/api/requests', (req: Request, res: Response) => {
  const { type, tableId, waiterId, details, targetTableId } = req.body;

  const table = memoryDb.tables.find((t) => t.id === tableId);
  if (!table) {
    return res.status(404).json({ success: false, error: 'Table not found.' });
  }

  const waiter = memoryDb.waiters.find((w) => w.id === waiterId);
  const targetTable = targetTableId ? memoryDb.tables.find((t) => t.id === targetTableId) : null;

  const newRequest: KitchenRequest = {
    id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    tableId: table.id,
    tableNumber: table.tableNumber,
    orderId: table.currentOrderId || undefined,
    waiterId: waiterId || 'staff',
    waiterName: waiter ? waiter.name : 'Waiter',
    details: details || '',
    targetTableId: targetTable ? targetTable.id : undefined,
    targetTableNumber: targetTable ? targetTable.tableNumber : undefined,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  if (type === 'bill_request') {
    table.status = 'bill_requested';
    if (table.currentOrderId) {
      const order = memoryDb.orders.find((o) => o.id === table.currentOrderId);
      if (order) order.billRequested = true;
    }
  }

  memoryDb.requests.unshift(newRequest);
  saveDb(memoryDb);

  broadcastEvent('REQUEST_CREATED', newRequest);
  broadcastEvent('TABLES_UPDATED', memoryDb.tables);

  res.json({ success: true, request: newRequest });
});

// Update Request Status (Kitchen acknowledges / resolves / approves transfer)
app.patch('/api/requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, action } = req.body;

  const request = memoryDb.requests.find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ success: false, error: 'Request not found.' });
  }

  request.status = status;

  // Handle table transfer approval
  if (request.type === 'transfer_request' && status === 'approved' && request.targetTableId && request.orderId) {
    const currentTable = memoryDb.tables.find((t) => t.id === request.tableId);
    const targetTable = memoryDb.tables.find((t) => t.id === request.targetTableId);
    const order = memoryDb.orders.find((o) => o.id === request.orderId);

    if (currentTable && targetTable && order) {
      // Transfer order
      order.tableId = targetTable.id;
      order.tableNumber = targetTable.tableNumber;
      order.updatedAt = new Date().toISOString();

      targetTable.status = currentTable.status;
      targetTable.currentOrderId = order.id;

      currentTable.status = 'available';
      currentTable.currentOrderId = null;
    }
  }

  // Handle cancellation approval
  if (request.type === 'cancel_request' && status === 'approved' && request.orderId) {
    const order = memoryDb.orders.find((o) => o.id === request.orderId);
    if (order) {
      order.status = 'cancelled';
      order.updatedAt = new Date().toISOString();
    }
    const table = memoryDb.tables.find((t) => t.id === request.tableId);
    if (table) {
      table.status = 'available';
      table.currentOrderId = null;
    }
  }

  saveDb(memoryDb);

  broadcastEvent('REQUEST_UPDATED', request);
  broadcastEvent('TABLES_UPDATED', memoryDb.tables);
  broadcastEvent('ORDER_UPDATED', { orderId: request.orderId });

  res.json({ success: true, request });
});

// Table Direct Transfer (Kitchen or Waiter quick transfer)
app.post('/api/tables/transfer', (req: Request, res: Response) => {
  const { sourceTableId, targetTableId } = req.body;

  const sourceTable = memoryDb.tables.find((t) => t.id === sourceTableId);
  const targetTable = memoryDb.tables.find((t) => t.id === targetTableId);

  if (!sourceTable || !targetTable) {
    return res.status(404).json({ success: false, error: 'Tables not found.' });
  }

  if (!sourceTable.currentOrderId) {
    return res.status(400).json({ success: false, error: 'Source table has no active order.' });
  }

  if (targetTable.currentOrderId && targetTable.status !== 'available') {
    return res.status(400).json({ success: false, error: 'Target table is already occupied.' });
  }

  const order = memoryDb.orders.find((o) => o.id === sourceTable.currentOrderId);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Active order not found.' });
  }

  // Perform transfer
  order.tableId = targetTable.id;
  order.tableNumber = targetTable.tableNumber;
  order.updatedAt = new Date().toISOString();

  targetTable.status = sourceTable.status;
  targetTable.currentOrderId = order.id;

  sourceTable.status = 'available';
  sourceTable.currentOrderId = null;

  saveDb(memoryDb);

  broadcastEvent('ORDER_UPDATED', { order });
  broadcastEvent('TABLES_UPDATED', memoryDb.tables);

  res.json({ success: true, order, tables: memoryDb.tables });
});

// Manage Tables (Add, Edit, Deactivate)
app.post('/api/tables', (req: Request, res: Response) => {
  const { id, tableNumber, name, capacity, section, active } = req.body;

  if (id) {
    // Edit table
    const table = memoryDb.tables.find((t) => t.id === id);
    if (!table) return res.status(404).json({ success: false, error: 'Table not found' });
    if (tableNumber !== undefined) table.tableNumber = Number(tableNumber);
    if (name !== undefined) table.name = name;
    if (capacity !== undefined) table.capacity = Number(capacity);
    if (section !== undefined) table.section = section;
    if (active !== undefined) table.active = active;
  } else {
    // Add new table
    const newTable: Table = {
      id: `tbl-${Date.now()}`,
      tableNumber: Number(tableNumber) || (memoryDb.tables.length + 1),
      name: name || `Table ${tableNumber || memoryDb.tables.length + 1}`,
      capacity: Number(capacity) || 4,
      section: section || 'Main Dining',
      status: 'available',
      active: true
    };
    memoryDb.tables.push(newTable);
  }

  saveDb(memoryDb);
  broadcastEvent('TABLES_UPDATED', memoryDb.tables);
  res.json({ success: true, tables: memoryDb.tables });
});

// Manage Menu Items (Add, Edit, Deactivate, Stock, Spice, Add-ons)
app.post('/api/menu', (req: Request, res: Response) => {
  const itemData = req.body;

  if (itemData.id) {
    const itemIndex = memoryDb.menu.findIndex((m) => m.id === itemData.id);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Menu item not found.' });
    }
    memoryDb.menu[itemIndex] = { ...memoryDb.menu[itemIndex], ...itemData };
  } else {
    const newItem: MenuItem = {
      id: `m-${Date.now()}`,
      name: itemData.name,
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
    memoryDb.menu.push(newItem);
  }

  saveDb(memoryDb);
  broadcastEvent('MENU_UPDATED', memoryDb.menu);
  res.json({ success: true, menu: memoryDb.menu });
});

// Manage Waiters (Add, Edit, Deactivate)
app.post('/api/waiters', (req: Request, res: Response) => {
  const waiterData = req.body;

  if (waiterData.id) {
    const waiterIndex = memoryDb.waiters.findIndex((w) => w.id === waiterData.id);
    if (waiterIndex === -1) {
      return res.status(404).json({ success: false, error: 'Waiter not found.' });
    }
    memoryDb.waiters[waiterIndex] = { ...memoryDb.waiters[waiterIndex], ...waiterData };
  } else {
    const newWaiter: WaiterAccount = {
      id: `w-${Date.now()}`,
      name: waiterData.name,
      pin: waiterData.pin || '1234',
      phone: waiterData.phone || '',
      active: waiterData.active !== undefined ? waiterData.active : true,
      totalOrdersServed: 0,
      createdAt: new Date().toISOString()
    };
    memoryDb.waiters.push(newWaiter);
  }

  saveDb(memoryDb);
  broadcastEvent('WAITERS_UPDATED', memoryDb.waiters);
  res.json({ success: true, waiters: memoryDb.waiters });
});

// Manage Settings & Sound Settings
app.post('/api/settings', (req: Request, res: Response) => {
  const { restaurant, soundSettings } = req.body;

  if (restaurant) {
    memoryDb.restaurant = { ...memoryDb.restaurant, ...restaurant };
  }

  if (soundSettings) {
    memoryDb.soundSettings = { ...memoryDb.soundSettings, ...soundSettings };
  }

  saveDb(memoryDb);
  broadcastEvent('SETTINGS_UPDATED', {
    restaurant: memoryDb.restaurant,
    soundSettings: memoryDb.soundSettings
  });

  res.json({
    success: true,
    restaurant: memoryDb.restaurant,
    soundSettings: memoryDb.soundSettings
  });
});

// Backup: Export Database JSON
app.get('/api/backup/export', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=sri_raghavi_pos_backup_${Date.now()}.json`);
  res.send(JSON.stringify(memoryDb, null, 2));
});

// Backup: Restore Database JSON
app.post('/api/backup/restore', (req: Request, res: Response) => {
  const backupData = req.body;
  if (!backupData || !backupData.restaurant || !Array.isArray(backupData.tables) || !Array.isArray(backupData.menu)) {
    return res.status(400).json({ success: false, error: 'Invalid backup file structure.' });
  }

  memoryDb = {
    ...backupData,
    version: (memoryDb.version || 1) + 1
  };

  saveDb(memoryDb);
  broadcastEvent('RESET_DATA', memoryDb);

  res.json({ success: true, message: 'Database restored successfully.', data: memoryDb });
});

// Reset Demo Data
app.post('/api/backup/reset', (_req: Request, res: Response) => {
  memoryDb = getInitialDatabase();
  saveDb(memoryDb);
  broadcastEvent('RESET_DATA', memoryDb);
  res.json({ success: true, message: 'System reset to default state.', data: memoryDb });
});

// Vite Middleware integration
async function startServer() {
  const port = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Sri Raghavi Kitchen POS server running on http://0.0.0.0:${port}`);
  });
}

startServer();
