import { useState, useEffect } from 'react';
import { erpApi } from '../api/erp';
import type { Inventory } from '../types';

export default function InventoryManager() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [formData, setFormData] = useState<Partial<Inventory>>({
    name: '',
    sku: '',
    quantity: 0,
    price: 0,
    category: '',
  });

  useEffect(() => {
    loadInventory();
  }, []);

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
      if (editingItem) {
        await erpApi.updateInventory(editingItem.id!, formData);
      } else {
        await erpApi.createInventory(formData);
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', sku: '', quantity: 0, price: 0, category: '' });
      loadInventory();
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  };

  const handleEdit = (item: Inventory) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await erpApi.deleteInventory(id);
        loadInventory();
      } catch (error) {
        console.error('Error deleting inventory:', error);
      }
    }
  };

  return (
    <div className="inventory-manager">
      <div className="header">
        <h2>📦 Inventory Management</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Item
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Item Name *</label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g., Laptop, Mouse, Keyboard"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="sku">SKU (Stock Keeping Unit) *</label>
                <input
                  id="sku"
                  type="text"
                  placeholder="e.g., LAP001, MOU002"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity in Stock *</label>
                <input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price per Unit ($) *</label>
                <input
                  id="price"
                  type="number"
                  placeholder="e.g., 999.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  id="category"
                  type="text"
                  placeholder="e.g., Electronics, Office Supplies"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setFormData({ name: '', sku: '', quantity: 0, price: 0, category: '' });
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

      <div className="table-container">
        {inventory.length === 0 ? (
          <div className="empty-state">
            <p>📦 No inventory items yet</p>
            <p>Click "+ Add Item" to add your first product</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.category || '-'}</td>
                  <td>
                    <button onClick={() => handleEdit(item)} className="btn-small">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id!)} className="btn-small btn-danger">
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
