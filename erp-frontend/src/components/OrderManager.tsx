import { useState, useEffect } from 'react';
import { erpApi } from '../api/erp';
import type { Order, Inventory } from '../types';

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItems, setSelectedItems] = useState<{inventory_id: number, quantity: number}[]>([]);
  const [formData, setFormData] = useState<Partial<Order>>({
    customer_name: '',
    total_amount: 0,
    status: 'pending',
  });

  useEffect(() => {
    loadOrders();
    loadInventory();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await erpApi.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await erpApi.getInventory();
      setInventory(response.data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate total from selected items
      const totalAmount = selectedItems.reduce((sum, item) => {
        const invItem = inventory.find(i => i.id === item.inventory_id);
        return sum + (invItem ? invItem.price * item.quantity : 0);
      }, 0);

      const orderData = {
        ...formData,
        total_amount: totalAmount,
      };

      let orderId;
      if (editingOrder) {
        await erpApi.updateOrder(editingOrder.id!, orderData);
        orderId = editingOrder.id;
      } else {
        const response = await erpApi.createOrder(orderData);
        orderId = response.data.id;
      }

      // Add items to order and update inventory
      for (const item of selectedItems) {
        await erpApi.createOrderItem?.(orderId, item);
      }

      setShowForm(false);
      setEditingOrder(null);
      setSelectedItems([]);
      setFormData({ customer_name: '', total_amount: 0, status: 'pending' });
      loadOrders();
      loadInventory(); // Refresh inventory to show updated quantities
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const addItemToOrder = (inventoryId: number, quantity: number) => {
    const existing = selectedItems.find(i => i.inventory_id === inventoryId);
    if (existing) {
      setSelectedItems(selectedItems.map(i => 
        i.inventory_id === inventoryId 
          ? { ...i, quantity: i.quantity + quantity }
          : i
      ));
    } else {
      setSelectedItems([...selectedItems, { inventory_id: inventoryId, quantity }]);
    }
  };

  const removeItemFromOrder = (inventoryId: number) => {
    setSelectedItems(selectedItems.filter(i => i.inventory_id !== inventoryId));
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData(order);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await erpApi.deleteOrder(id);
        loadOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleViewDetails = async (order: Order) => {
    try {
      const response = await erpApi.getOrder(order.id!);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="order-manager">
      <div className="header">
        <h2>🛒 Order Management</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Create Order
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <h3>{editingOrder ? 'Edit Order' : 'Create New Order'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="customer_name">Customer Name *</label>
                <input
                  id="customer_name"
                  type="text"
                  placeholder="e.g., John Smith"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Order Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="order-items-section">
                <h4>Add Items from Inventory</h4>
                <div className="inventory-selector">
                  <select
                    onChange={(e) => {
                      const invId = Number(e.target.value);
                      if (invId) {
                        addItemToOrder(invId, 1);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">Select item to add...</option>
                    {inventory.filter(i => i.quantity > 0).map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} (SKU: {item.sku}) - ${item.price.toFixed(2)} - {item.quantity} in stock
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItems.length > 0 && (
                  <div className="selected-items">
                    <h5>Selected Items:</h5>
                    {selectedItems.map(item => {
                      const invItem = inventory.find(i => i.id === item.inventory_id);
                      return (
                        <div key={item.inventory_id} className="selected-item">
                          <span>{invItem?.name} x {item.quantity}</span>
                          <span>${((invItem?.price || 0) * item.quantity).toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => removeItemFromOrder(item.inventory_id)}
                            className="btn-small btn-danger"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                    <div className="order-total">
                      <strong>Total: ${selectedItems.reduce((sum, item) => {
                        const invItem = inventory.find(i => i.id === item.inventory_id);
                        return sum + (invItem ? invItem.price * item.quantity : 0);
                      }, 0).toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={selectedItems.length === 0}>
                  {editingOrder ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingOrder(null);
                    setSelectedItems([]);
                    setFormData({ customer_name: '', total_amount: 0, status: 'pending' });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="modal">
          <div className="modal-content">
            <h3>Order Details</h3>
            <div className="order-details">
              <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
              <p><strong>Total:</strong> ${selectedOrder.total_amount.toFixed(2)}</p>
              <p><strong>Status:</strong> 
                <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </p>
              <h4>Items:</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <ul>
                  {selectedOrder.items.map((item) => (
                    <li key={item.id}>
                      {item.inventory_name} (SKU: {item.sku}) - Qty: {item.quantity} - 
                      ${item.price_at_time.toFixed(2)} each
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No items in this order</p>
              )}
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>🛒 No orders yet</p>
            <p>Click "+ Create Order" to create your first order</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>${order.total_amount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at || '').toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleViewDetails(order)} className="btn-small">
                      View
                    </button>
                    <button onClick={() => handleEdit(order)} className="btn-small">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(order.id!)} className="btn-small btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
