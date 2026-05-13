import db from '../database';

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

export class InventoryModel {
  static async getAll() {
    await db.read();
    return db.data?.inventory || [];
  }

  static async getById(id: number) {
    await db.read();
    return db.data?.inventory.find(i => i.id === id);
  }

  static async getBySku(sku: string) {
    await db.read();
    return db.data?.inventory.find(i => i.sku === sku);
  }

  static async create(inventory: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>) {
    await db.read();
    const newInventory = {
      ...inventory,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.data!.inventory.push(newInventory);
    await db.write();
    return newInventory;
  }

  static async update(id: number, inventory: Partial<Inventory>) {
    await db.read();
    const index = db.data!.inventory.findIndex(i => i.id === id);
    if (index !== -1) {
      db.data!.inventory[index] = {
        ...db.data!.inventory[index],
        ...inventory,
        updated_at: new Date().toISOString()
      };
      await db.write();
      return db.data!.inventory[index];
    }
    return null;
  }

  static async delete(id: number) {
    await db.read();
    const index = db.data!.inventory.findIndex(i => i.id === id);
    if (index !== -1) {
      db.data!.inventory.splice(index, 1);
      await db.write();
      return true;
    }
    return false;
  }

  static async updateQuantity(id: number, quantity: number) {
    return this.update(id, { quantity });
  }
}
