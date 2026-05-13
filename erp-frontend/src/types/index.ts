export interface User {
  id?: number;
  email: string;
  name: string;
  role: string;
  created_at?: string;
}

export interface Inventory {
  id?: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id?: number;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id?: number;
  order_id: number;
  inventory_id: number;
  quantity: number;
  price_at_time: number;
  inventory_name?: string;
  sku?: string;
}
