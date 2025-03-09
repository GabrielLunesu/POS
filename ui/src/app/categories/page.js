'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { categoryService } from '@/services/api';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        if (!isAuthenticated) {
          router.push('/login');
          return;
        }
        
        // Fetch categories
        const categoriesData = await categoryService.getAll();
        setCategories(categoriesData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
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
  
  // Open add category modal
  const handleAddCategory = () => {
    setFormData({
      name: '',
      description: ''
    });
    setShowAddModal(true);
  };
  
  // Open edit category modal
  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowEditModal(true);
  };
  
  // Submit new category
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const categoryData = {
        name: formData.name,
        description: formData.description
      };
      
      const newCategory = await categoryService.create(categoryData);
      
      setCategories(prev => [...prev, newCategory]);
      setShowAddModal(false);
      toast.success('Category added successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
      setIsLoading(false);
    }
  };
  
  // Submit edit category
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const categoryData = {
        name: formData.name,
        description: formData.description,
        isActive: true
      };
      
      await categoryService.update(currentCategory.id, categoryData);
      
      setCategories(prev => 
        prev.map(c => c.id === currentCategory.id ? { ...c, ...categoryData } : c)
      );
      
      setShowEditModal(false);
      toast.success('Category updated successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      setIsLoading(false);
    }
  };
  
  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) return;
    
    try {
      setIsLoading(true);
      await categoryService.delete(categoryId);
      
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      toast.success('Category deleted successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      setIsLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Category Management</h1>
            {hasRole(['Admin', 'Manager']) && (
              <button
                onClick={handleAddCategory}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add New Category
              </button>
            )}
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
                    <th className="px-4 py-2 border">Description</th>
                    <th className="px-4 py-2 border">Products</th>
                    <th className="px-4 py-2 border">Created</th>
                    {hasRole(['Admin', 'Manager']) && (
                      <th className="px-4 py-2 border">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.id}>
                      <td className="px-4 py-2 border">{category.name}</td>
                      <td className="px-4 py-2 border">{category.description}</td>
                      <td className="px-4 py-2 border text-center">{category.productCount}</td>
                      <td className="px-4 py-2 border">{new Date(category.createdAt).toLocaleDateString()}</td>
                      {hasRole(['Admin', 'Manager']) && (
                        <td className="px-4 py-2 border">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-2 text-center">No categories found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Add Category Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add New Category</h2>
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
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Add Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Edit Category Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Edit Category</h2>
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
                      Update Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 