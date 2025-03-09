'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import POSLayout from '@/components/layouts/POSLayout';
import CategoryList from '@/components/pos/CategoryList';
import ProductGrid from '@/components/pos/ProductGrid';
import Cart from '@/components/pos/Cart';
import Receipt from '@/components/pos/Receipt';
import { categoryService, productService, saleService, testBackendConnection } from '@/services/api';
import toast from 'react-hot-toast';

/**
 * POS (Point of Sale) page
 * Main cashier interface for the POS system
 */
export default function POSPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // State for categories and products
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // State for cart
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  
  // State for receipt
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  
  // Test backend connection
  const checkBackendConnection = async () => {
    try {
      const result = await testBackendConnection();
      console.log('Backend connection test:', result);
      
      if (!result.success) {
        setConnectionError(`Cannot connect to backend server: ${result.error}`);
        toast.error('Failed to connect to the backend server. Please ensure it is running.');
      }
      
      return result;
    } catch (error) {
      console.error('Error testing backend connection:', error);
      setConnectionError('Failed to test backend connection');
      return { success: false, error: error.message };
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    const initializeData = async () => {
      // Check backend connection first
      const connectionResult = await checkBackendConnection();
      if (connectionResult.success) {
        // Only fetch data if backend connection is successful
        await fetchData();
      }
    };
    
    initializeData();
  }, [router, isAuthenticated]);
  
  // Define fetchData function
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setConnectionError(null); // Reset connection error
      
      console.log('Fetching POS data...');
      
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.error('User is not authenticated, redirecting to login');
        router.push('/login');
        return;
      }
      
      // Log authentication state
      console.log('Authentication state:', { 
        isAuthenticated, 
        hasToken: !!localStorage.getItem('token'),
        tokenPreview: localStorage.getItem('token') ? 
          `${localStorage.getItem('token').substring(0, 10)}...` : 'none'
      });
      
      // Fetch categories
      console.log('Fetching categories...');
      const categoriesData = await categoryService.getAll();
      console.log('Categories fetched:', categoriesData.length);
      setCategories(categoriesData);
      
      let fetchedProducts = [];
      if (categoriesData.length > 0) {
        setActiveCategory(categoriesData[0]);
        
        // Fetch products for the first category
        console.log('Fetching products for category:', categoriesData[0].id);
        fetchedProducts = await productService.getByCategory(categoriesData[0].id);
        console.log('Products fetched:', fetchedProducts.length);
        setProducts(fetchedProducts);
      }
      
      // Set filtered products to all products initially
      setFilteredProducts(fetchedProducts);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching POS data:', error);
      
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        console.error('Authentication error (401), redirecting to login');
        // Clear any potentially invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        setConnectionError('Failed to load data. Please try again.');
      }
      
      setIsLoading(false);
    }
  };
  
  // Handle category selection
  const handleCategorySelect = async (category) => {
    try {
      setIsLoading(true);
      setActiveCategory(category);
      
      console.log('Fetching products for category:', category.id);
      const productsData = await productService.getByCategory(category.id);
      console.log('Products fetched:', productsData.length);
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products for category:', error);
      toast.error('Failed to load products for this category');
      setIsLoading(false);
    }
  };
  
  // Handle adding item to cart
  const handleAddToCart = (product) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Add new item if it doesn't exist
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    
    toast.success(`Added ${product.name} to cart`);
  };
  
  // Handle updating item quantity in cart
  const handleUpdateQuantity = (itemId, newQuantity) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  // Handle removing item from cart
  const handleRemoveItem = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast.success('Item removed from cart');
  };
  
  // Handle clearing cart
  const handleClearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared');
  };
  
  // Handle checkout
  const handleCheckout = async (paymentMethod) => {
    try {
      setIsLoading(true);
      
      // Create sale data
      const saleData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          discount: 0
        })),
        paymentMethod: paymentMethod,
        discount: 0,
        notes: `Sale completed via POS by ${user?.username || 'staff'}`
      };
      
      // Submit sale to API
      const response = await saleService.create(saleData);
      
      // Show receipt
      setCurrentSale(response);
      setShowReceipt(true);
      
      // Clear cart after successful checkout
      setCartItems([]);
      
      toast.success('Order completed successfully!');
      setIsLoading(false);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process order');
      setIsLoading(false);
    }
  };
  
  // Close receipt modal
  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCurrentSale(null);
  };
  
  return (
    <ProtectedRoute>
      <POSLayout>
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading POS data...</p>
            </div>
          ) : connectionError ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-center p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-red-500 mb-2">Connection Error</h3>
                <p className="text-gray-600 mb-4">{connectionError}</p>
                <p className="text-gray-600 mb-4">Please ensure the backend server is running at http://localhost:5124</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4">
              {/* Categories sidebar */}
              <div className="col-span-12 md:col-span-3 lg:col-span-2">
                <CategoryList 
                  categories={categories} 
                  activeCategory={activeCategory}
                  onCategorySelect={handleCategorySelect}
                />
              </div>
              
              {/* Products grid */}
              <div className="col-span-12 md:col-span-6 lg:col-span-7">
                <ProductGrid 
                  products={filteredProducts}
                  category={activeCategory}
                  onAddToCart={handleAddToCart}
                />
              </div>
              
              {/* Cart */}
              <div className="col-span-12 md:col-span-3 lg:col-span-3">
                <Cart 
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onClearCart={handleClearCart}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          )}
          
          {/* Receipt Modal */}
          {showReceipt && currentSale && (
            <Receipt sale={currentSale} onClose={handleCloseReceipt} />
          )}
        </div>
      </POSLayout>
    </ProtectedRoute>
  );
} 