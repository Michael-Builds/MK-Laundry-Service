const Database = require('better-sqlite3');
const path = require('path');

const dataDirectory = process.env.MK_LAUNDRY_DATA_DIR
  || (process.versions.electron ? require('electron').app.getPath('userData') : __dirname);
const db = new Database(path.join(dataDirectory, 'laundry.sqlite'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS employees (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    username TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    expires_at TEXT
  );
  CREATE TABLE IF NOT EXISTS prices (
    item TEXT PRIMARY KEY,
    amount REAL NOT NULL
  );
  CREATE TABLE IF NOT EXISTS inventory (
    item TEXT PRIMARY KEY,
    quantity INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    phone TEXT NOT NULL,
    delivery TEXT NOT NULL,
    payment TEXT NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    items TEXT NOT NULL
  );
`);
try { db.prepare('ALTER TABLE employees ADD COLUMN phone TEXT').run(); } catch (error) { if (!error.message.includes('duplicate column name')) throw error; }
try { db.prepare('ALTER TABLE employees ADD COLUMN username TEXT').run(); } catch (error) { if (!error.message.includes('duplicate column name')) throw error; }
try { db.prepare('ALTER TABLE employees ADD COLUMN active INTEGER NOT NULL DEFAULT 1').run(); } catch (error) { if (!error.message.includes('duplicate column name')) throw error; }
try { db.prepare('ALTER TABLE employees ADD COLUMN expires_at TEXT').run(); } catch (error) { if (!error.message.includes('duplicate column name')) throw error; }

const defaultPrices = { Shirt: 5, Trousers: 8, Dress: 15, Suit: 18, 'Bed sheet': 12, Jacket: 10 };
const seed = db.transaction(() => {
  db.prepare('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run('admin', 'admin123', 'Administrator', 'Administrator');
  const insertPrice = db.prepare('INSERT OR IGNORE INTO prices (item, amount) VALUES (?, ?)');
  Object.entries(defaultPrices).forEach(([item, amount]) => insertPrice.run(item, amount));
  const insertInventory = db.prepare('INSERT OR IGNORE INTO inventory (item, quantity) VALUES (?, ?)');
  Object.keys(defaultPrices).forEach(item => insertInventory.run(item, 0));
});
seed();

function getState() {
  const users = Object.fromEntries(db.prepare('SELECT email, password, name, role FROM users').all().map(user => [user.email, user]));
  return {
    users,
    employees: db.prepare('SELECT name, CASE WHEN email = phone THEN NULL ELSE email END AS email, password, role, phone, COALESCE(username, phone) AS username, active, expires_at AS expiresAt FROM employees').all(),
    prices: Object.fromEntries(db.prepare("SELECT item, amount FROM prices WHERE item != '__default_discount__'").all().map(price => [price.item, price.amount])),
    inventory: Object.fromEntries(db.prepare('SELECT item, quantity FROM inventory').all().map(stock => [stock.item, stock.quantity])),
    defaultDiscount: db.prepare("SELECT amount FROM prices WHERE item = '__default_discount__'").get()?.amount || 0,
    orders: db.prepare('SELECT id, customer, phone, delivery, payment, discount, status, items FROM orders').all().map(order => ({ ...order, items: JSON.parse(order.items) }))
  };
}

function saveState(state) {
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM users').run();
    db.prepare('DELETE FROM employees').run();
    db.prepare('DELETE FROM prices').run();
    db.prepare('DELETE FROM inventory').run();
    db.prepare('DELETE FROM orders').run();
    const user = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
    Object.values(state.users).forEach(item => user.run(item.email, item.password, item.name, item.role));
    const employee = db.prepare('INSERT INTO employees (email, name, password, role, phone, username, active, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    state.employees.forEach(item => employee.run(item.email || item.username, item.name, item.password, item.role, null, item.username, item.active === false ? 0 : 1, item.expiresAt || null));
    const price = db.prepare('INSERT INTO prices (item, amount) VALUES (?, ?)');
    Object.entries(state.prices).forEach(([item, amount]) => price.run(item, amount));
    price.run('__default_discount__', state.defaultDiscount || 0);
    const inventory = db.prepare('INSERT INTO inventory (item, quantity) VALUES (?, ?)');
    Object.entries(state.inventory || {}).forEach(([item, quantity]) => inventory.run(item, Math.max(0, Number(quantity) || 0)));
    const order = db.prepare('INSERT INTO orders (id, customer, phone, delivery, payment, discount, status, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    state.orders.forEach(item => order.run(item.id, item.customer, item.phone, item.delivery, item.payment, item.discount || 0, item.status, JSON.stringify(item.items)));
  });
  transaction();
}

module.exports = { getState, saveState };
