export type UserRole = 'kitchen' | 'waiter';

export interface WaiterAccount {
  id: string;
  name: string;
  pin: string;
  phone?: string;
  active: boolean;
  totalOrdersServed: number;
  createdAt: string;
}

export type TableSection = 'AC Dining' | 'Main Dining' | 'Family Section' | 'Outdoor Garden';

export type TableStatus = 'available' | 'running' | 'preparing' | 'ready' | 'bill_requested';

export interface Table {
  id: string;
  tableNumber: number;
  name: string;
  capacity: number;
  section: TableSection;
  status: TableStatus;
  currentOrderId?: string | null;
  active: boolean;
}

export interface MenuItemAddOn {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  tamilName?: string;
  category: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  stockQuantity?: number | null;
  parcelCharge: number;
  spiceOptions: string[];
  addOns: MenuItemAddOn[];
}

export interface OrderItem {
  id: string;
  itemId: string;
  name: string;
  tamilName?: string;
  quantity: number;
  unitPrice: number;
  spiceLevel?: string;
  selectedAddOns: MenuItemAddOn[];
  notes?: string;
  isParcel: boolean;
  parcelCharge: number;
  totalPrice: number;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';

export interface KitchenOrderTicket {
  id: string;
  kotNumber: number;
  orderId: string;
  orderNumber: number;
  tableId: string;
  tableNumber: number;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  isAddition: boolean;
  specialInstructions?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableId: string;
  tableNumber: number;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  kots?: KitchenOrderTicket[];
  status: OrderStatus;
  isEntireOrderParcel: boolean;
  billRequested: boolean;
  cancellationRequested?: boolean;
  cancellationReason?: string;
  tableTransferRequested?: {
    targetTableId: string;
    targetTableNumber: number;
    reason?: string;
  };
  subtotal: number;
  parcelTotal: number;
  taxAmount: number;
  discountAmount: number;
  discountReason?: string;
  grandTotal: number;
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod?: 'cash' | 'upi' | 'card';
  createdAt: string;
  updatedAt: string;
  readyAt?: string;
  completedAt?: string;
}

export type RequestType = 'bill_request' | 'cancel_request' | 'transfer_request' | 'parcel_request' | 'assistance';
export type RequestStatus = 'pending' | 'acknowledged' | 'approved' | 'rejected' | 'resolved';

export interface KitchenRequest {
  id: string;
  type: RequestType;
  tableId: string;
  tableNumber: number;
  orderId?: string;
  waiterId: string;
  waiterName: string;
  details: string;
  targetTableId?: string;
  targetTableNumber?: number;
  status: RequestStatus;
  createdAt: string;
}

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0 to 1
  newOrderSound: boolean;
  readyOrderSound: boolean;
  requestAlertSound: boolean;
  soundType: 'chime' | 'loud_bell' | 'buzzer';
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  gstNumber: string;
  gstPercentage: number;
  defaultParcelCharge: number;
  kitchenPin: string;
}

export interface PosDatabase {
  restaurant: RestaurantSettings;
  soundSettings: SoundSettings;
  tables: Table[];
  menu: MenuItem[];
  orders: Order[];
  waiters: WaiterAccount[];
  requests: KitchenRequest[];
  lastOrderNumber: number;
  lastKotNumber?: number;
  version: number;
}

export type SseEventType =
  | 'BOOTSTRAP'
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELLED'
  | 'REQUEST_CREATED'
  | 'REQUEST_UPDATED'
  | 'TABLES_UPDATED'
  | 'MENU_UPDATED'
  | 'WAITERS_UPDATED'
  | 'SETTINGS_UPDATED'
  | 'RESET_DATA';

export interface SseEvent {
  type: SseEventType;
  data: any;
  timestamp: string;
}
