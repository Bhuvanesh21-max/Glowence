const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists for product images
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// Configure Multer for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Initialize SQLite Database
const db = new sqlite3.Database('./glowence.db', (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Connected to the SQLite database.');
});

// Create Tables (Products and Orders only)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price TEXT,
    description TEXT,
    image TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    orderId TEXT PRIMARY KEY,
    productName TEXT,
    price TEXT,
    date TEXT,
    status TEXT,
    location TEXT,
    expectedDelivery TEXT,
    customer TEXT,
    image TEXT
  )`);
});

// ================= API ENDPOINTS =================

// 1. PRODUCTS API
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const formattedProducts = rows.map(p => ({ ...p, reviews: [] }));
    res.json(formattedProducts);
  });
});

app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, price, description } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  db.run(`INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)`,
    [name, price, description, imageUrl],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, price, description, image: imageUrl, reviews: [] });
    }
  );
});

// Update Product Price
app.put('/api/products/:id', (req, res) => {
  const { price } = req.body;
  db.run(`UPDATE products SET price = ? WHERE id = ?`,
    [price, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Delete Product
app.delete('/api/products/:id', (req, res) => {
  db.run(`DELETE FROM products WHERE id = ?`,
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// 2. ORDERS API
app.get('/api/orders', (req, res) => {
  db.all("SELECT * FROM orders", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const formattedOrders = rows.map(o => ({
      orderId: o.orderId,
      product: { name: o.productName, price: o.price, image: o.image },
      date: o.date,
      status: o.status,
      location: o.location,
      expectedDelivery: o.expectedDelivery,
      customer: o.customer
    }));
    res.json(formattedOrders);
  });
});

app.post('/api/orders', (req, res) => {
  const { orderId, product, date, status, location, expectedDelivery, customer } = req.body;
  db.run(`INSERT OR REPLACE INTO orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [orderId, product.name, product.price, date, status, location, expectedDelivery, customer || 'guest', product.image],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Start Server
app.listen(PORT, () => {
  console.log(`Glowence backend server running on port ${PORT}`);
});