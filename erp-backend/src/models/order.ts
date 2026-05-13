import db from '../database';

export interface Order {
  id?: number;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: number;
  order_id: number;
  inventory_id: number;
  quantity: number;
  price_at_time: number;
}

export class OrderModel {
  static async getAll() {
    await db.read();
    return db.data?.orders || [];
  }

  static async getById(id: number) {
    await db.read();
    return db.data?.orders.find(o => o.id === id);
  }

  static async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    await db.read();
    const newOrder = {
      ...order,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.data!.orders.push(newOrder);
    await db.write();
    return newOrder;
  }

  static async update(id: number, order: Partial<Order>) {
    await db.read();
    const index = db.data!.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      db.data!.orders[index] = {
        ...db.data!.orders[index],
        ...order,
        updated_at: new Date().toISOString()
      };
      await db.write();
      return db.data!.orders[index];
    }
    return null;
  }

  static async delete(id: number) {
    await db.read();
    const index = db.data!.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      db.data!.orders.splice(index, 1);
      await db.write();
      return true;
    }
    return false;
  }

  static async getOrderItems(orderId: number) {
    await db.read();
    const items = db.data?.orderItems.filter(oi => oi.order_id === orderId) || [];
    // Join with inventory data
    const inventory = db.data?.inventory || [];
    return items.map(item => ({
      ...item,
      inventory_name: inventory.find(i => i.id === item.inventory_id)?.name || 'Unknown',
      sku: inventory.find(i => i.id === item.inventory_id)?.sku || 'Unknown'
    }));
  }

  static async addOrderItem(item: Omit<OrderItem, 'id'>) {
    await db.read();
    const newItem = {
      ...item,
      id: Date.now()
    };
    db.data!.orderItems.push(newItem);
    
    // Update inventory quantity
    const invIndex = db.data!.inventory.findIndex(i => i.id === item.inventory_id);
    if (invIndex !== -1) {
      db.data!.inventory[invIndex].quantity -= item.quantity;
      db.data!.inventory[invIndex].updated_at = new Date().toISOString();
    }
    
    await db.write();
    return newItem;
  }
}
