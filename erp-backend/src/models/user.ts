import db from '../database';

export interface User {
  id?: number;
  email: string;
  name: string;
  role: string;
  created_at?: string;
}

export class UserModel {
  static async getAll() {
    await db.read();
    return db.data?.users || [];
  }

  static async getById(id: number) {
    await db.read();
    return db.data?.users.find(u => u.id === id);
  }

  static async create(user: Omit<User, 'id' | 'created_at'>) {
    await db.read();
    const newUser = {
      ...user,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    db.data!.users.push(newUser);
    await db.write();
    return newUser;
  }

  static async update(id: number, user: Partial<User>) {
    await db.read();
    const index = db.data!.users.findIndex(u => u.id === id);
    if (index !== -1) {
      db.data!.users[index] = { ...db.data!.users[index], ...user };
      await db.write();
      return db.data!.users[index];
    }
    return null;
  }

  static async delete(id: number) {
    await db.read();
    const index = db.data!.users.findIndex(u => u.id === id);
    if (index !== -1) {
      db.data!.users.splice(index, 1);
      await db.write();
      return true;
    }
    return false;
  }
}
