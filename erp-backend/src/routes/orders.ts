import express from 'express';
import { OrderModel } from '../models/order';

const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await OrderModel.getAll();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await OrderModel.getById(Number(req.params.id));
    if (order) {
      const items = await OrderModel.getOrderItems(Number(req.params.id));
      res.json({ success: true, data: { ...order, items } });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching order' });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const order = await OrderModel.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating order' });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const order = await OrderModel.update(Number(req.params.id), req.body);
    if (order) {
      res.json({ success: true, data: order });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order' });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const success = await OrderModel.delete(Number(req.params.id));
    if (success) {
      res.json({ success: true, message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting order' });
  }
});

// Add item to order
router.post('/:id/items', async (req, res) => {
  try {
    const item = await OrderModel.addOrderItem({
      order_id: Number(req.params.id),
      ...req.body
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding item to order' });
  }
});

// Get order items
router.get('/:id/items', async (req, res) => {
  try {
    const items = await OrderModel.getOrderItems(Number(req.params.id));
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching order items' });
  }
});

export default router;
