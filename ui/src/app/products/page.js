'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { productService, categoryService } from '@/services/api';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated, hasRole, user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    quantity: '',
    barcode: '',
    categoryId: '',
    imageUrl: ''
  });
  
  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        if (!isAuthenticated) {
          router.push('/login');
          return;
        }
        
        // Fetch products and categories
        const [productsData, categoriesData] = await Promise.all([
          productService.getAll(),
          categoryService.getAll()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, router]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open add product modal
  const handleAddProduct = () => {
    console.log('Opening add product modal');
    setFormData({
      name: '',
      description: '',
      price: '',
      cost: '',
      quantity: '',
      barcode: '',
      categoryId: categories.length > 0 ? categories[0].id.toString() : '',
      imageUrl: ''
    });
    setShowAddModal(true);
    console.log('showAddModal set to true');
  };
  
  // Open edit product modal
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      cost: product.cost.toString(),
      quantity: product.quantity.toString(),
      barcode: product.barcode || '',
      categoryId: product.categoryId ? product.categoryId.toString() : '',
      imageUrl: product.imageUrl || ''
    });
    setShowEditModal(true);
  };
  
  // Submit new product
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        quantity: parseInt(formData.quantity),
        barcode: formData.barcode,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        imageUrl: formData.imageUrl
      };
      
      const newProduct = await productService.create(productData);
      
      setProducts(prev => [...prev, newProduct]);
      setShowAddModal(false);
      toast.success('Product added successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
      setIsLoading(false);
    }
  };
  
  // Submit edit product
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        quantity: parseInt(formData.quantity),
        barcode: formData.barcode,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        imageUrl: formData.imageUrl,
        isActive: true
      };
      
      const updatedProduct = await productService.update(currentProduct.id, productData);
      
      setProducts(prev => 
        prev.map(p => p.id === currentProduct.id ? { ...p, ...productData, categoryName: categories.find(c => c.id === parseInt(formData.categoryId))?.name } : p)
      );
      
      setShowEditModal(false);
      toast.success('Product updated successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
      setIsLoading(false);
    }
  };
  
  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setIsLoading(true);
      await productService.delete(productId);
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      setIsLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Product Management</h1>
              {hasRole(['Admin', 'Manager']) ? (
                <button
                  onClick={() => {
                    console.log('Add Product button clicked');
                    handleAddProduct();
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add New Product
                </button>
              ) : (
                <p className="text-sm text-gray-500">Admin or Manager role required to add products</p>
              )}
            </div>
            
            {/* Debug info */}
            <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
              <p>Modal state: {showAddModal ? 'Open' : 'Closed'}</p>
              <p>User role: {user?.role || 'Unknown'}</p>
              <p>Can manage products: {hasRole(['Admin', 'Manager']) ? 'Yes' : 'No'}</p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">Name</th>
                      <th className="px-4 py-2 border">Category</th>
                      <th className="px-4 py-2 border">Price</th>
                      <th className="px-4 py-2 border">Cost</th>
                      <th className="px-4 py-2 border">Quantity</th>
                      {hasRole(['Admin', 'Manager']) && (
                        <th className="px-4 py-2 border">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td className="px-4 py-2 border">{product.name}</td>
                        <td className="px-4 py-2 border">{product.categoryName || 'Uncategorized'}</td>
                        <td className="px-4 py-2 border">${product.price.toFixed(2)}</td>
                        <td className="px-4 py-2 border">${product.cost.toFixed(2)}</td>
                        <td className="px-4 py-2 border">{product.quantity}</td>
                        {hasRole(['Admin', 'Manager']) && (
                          <td className="px-4 py-2 border">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-2 text-center">No products found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Add Product Modal */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Add New Product</h2>
                  <form onSubmit={handleSubmitAdd}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Price</label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                          step="0.01"
                          min="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Cost</label>
                        <input
                          type="number"
                          name="cost"
                          value={formData.cost}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                          step="0.01"
                          min="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Quantity</label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Barcode</label>
                        <input
                          type="text"
                          name="barcode"
                          value={formData.barcode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Category</label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Image URL</label>
                      <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          console.log('Cancel button clicked');
                          setShowAddModal(false);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Add Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Edit Product Modal */}
            {showEditModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Edit Product</h2>
                  <form onSubmit={handleSubmitEdit}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Price</label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                          step="0.01"
                          min="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Cost</label>
                        <input
                          type="number"
                          name="cost"
                          value={formData.cost}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                          step="0.01"
                          min="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Quantity</label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Barcode</label>
                        <input
                          type="text"
                          name="barcode"
                          value={formData.barcode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Category</label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Image URL</label>
                      <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Update Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 