import express from 'express';
import { InventoryModel } from '../models/inventory';

const router = express.Router();

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const inventory = await InventoryModel.getAll();
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching inventory' });
  }
});

// Get inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await InventoryModel.getById(Number(req.params.id));
    if (item) {
      res.json({ success: true, data: item });
    } else {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching inventory item' });
  }
});

// Get inventory item by SKU
router.get('/sku/:sku', async (req, res) => {
  try {
    const item = await InventoryModel.getBySku(req.params.sku);
    if (item) {
      res.json({ success: true, data: item });
    } else {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching inventory item' });
  }
});

// Create inventory item
router.post('/', async (req, res) => {
  try {
    const item = await InventoryModel.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating inventory item' });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const item = await InventoryModel.update(Number(req.params.id), req.body);
    if (item) {
      res.json({ success: true, data: item });
    } else {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating inventory item' });
  }
});

// Update inventory quantity
router.patch('/:id/quantity', async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await InventoryModel.updateQuantity(Number(req.params.id), quantity);
    if (item) {
      res.json({ success: true, data: item });
    } else {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating inventory quantity' });
  }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const success = await InventoryModel.delete(Number(req.params.id));
    if (success) {
      res.json({ success: true, message: 'Inventory item deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting inventory item' });
  }
});

export default router;
