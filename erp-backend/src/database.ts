import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, '../db.json');

interface Data {
  users: any[];
  inventory: any[];
  orders: any[];
  orderItems: any[];
}

const adapter = new JSONFile<Data>(dbFile);
const defaultData: Data = {
  users: [],
  inventory: [],
  orders: [],
  orderItems: []
};

const db = new Low<Data>(adapter, defaultData);

// Initialize database
export async function initializeDatabase() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
  console.log('Database initialized successfully');
}

export default db;
