import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import API_BASE from '../config';

const CartContext = createContext();

const API_URL = `${API_BASE}/api`;

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const { showNotification } = useNotification();
  const { customer } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [orders, setOrders] = useState([]);
  const [sessionId, setSessionId] = useState(localStorage.getItem('cart_session_id'));

  // Shared Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('cart');
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Initialize Session and Fetch Cart
  useEffect(() => {
    let sId = sessionId;
    if (!sId) {
      sId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('cart_session_id', sId);
      setSessionId(sId);
    }
    fetchCart(sId);
  }, []);

  // Fetch orders when customer changes (login/logout)
  useEffect(() => {
    const sId = localStorage.getItem('cart_session_id');
    if (customer) {
      syncAndFetchAll(sId);
      syncWishlist(); // Sync any local wishlist items to the DB on login
    }
  }, [customer]);

  const syncAndFetchAll = async (sId) => {
    await fetchOrders();
    await fetchCart(sId);
    await fetchWishlist();
  };

  // Persist Wishlist
  useEffect(() => {
    localStorage.setItem('wishlist_items', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/my-orders`, {
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        console.log(`[REGISTRY_SYNC] Manifesting ${data.length} archived acquisitions.`);
        const mappedOrders = data.map(order => ({
          ...order,
          date: new Date(order.created_at || order.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          }),
          total: parseFloat(order.total_amount),
          fullItems: (order.items || []).map(item => ({
            ...item,
            price: parseFloat(item.price)
          }))
        }));
        setOrders(mappedOrders);
      } else {
        console.error("[REGISTRY_SYNC] Procurement interruption:", data.message || "Unknown archive response");
        setOrders([]);
      }
    } catch (error) {
      console.error('[REGISTRY_SYNC] Archival connection crash:', error);
    }
  };

  const fetchCart = async (sId) => {
    try {
      const res = await fetch(`${API_URL}/cart?sessionId=${sId || sessionId}`, { 
        credentials: 'include' 
      });
      const data = await res.json();

      if (data.items) {
        const items = data.items.map(item => ({
          ...item.Product,
          id: item.product_id,
          cartItemId: item.id,
          quantity: item.quantity,
          options: item.options,
          price: item.price,
          image: item.image || item.Product?.image,
    tax_rate: item.Product?.tax_rate ?? null,   // explicitly carry product-level tax rate
          cartKey: item.id
        }));
                 // Sort by cartItemId DESC (LIFO - Newest at top)
        const sortedItems = items.sort((a, b) => (b.cartItemId || 0) - (a.cartItemId || 0));
        setCartItems(sortedItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${API_URL}/wishlist`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const syncWishlist = async () => {
    const localWishIds = wishlistItems.map(i => i.id);
    if (localWishIds.length === 0) {
      return fetchWishlist();
    }
    try {
      const res = await fetch(`${API_URL}/wishlist/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productIds: localWishIds })
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data);
      }
    } catch (error) {
      console.error('Error syncing wishlist:', error);
    }
  };

  const addToCart = async (product, options = {}, quantity = 1) => {
    try {
      // Workflow: Map HomeSectionItem to Product if exists
      const pId = product.product_id || product.id;

      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: product.product_id || product.id,
          quantity,
          options,
          sessionId
        })
      });

      if (res.ok) {
        await fetchCart(sessionId);
        openSidebar('cart');
      } else {
        const err = await res.json();
        console.error(`[CART_ADD_FAILURE] Status: ${res.status} URL: ${res.url}`, err);
        showNotification(err.message || 'Error processing selection in the studio archive.', 'error');
      }
    } catch (error) {
      console.error('[CART_ADD_CRASH] Critical failure:', error);
      showNotification('Archive Connection Failure: Could not reach the checkout studio.', 'error');
    }
  };

  const removeFromCart = async (cartItemId) => {
    // If cartItemId is not available (e.g. legacy local state), we might need to handle it.
    // But since we're moving to DB only, cartItemId should always be there.
    try {
      await fetch(`${API_URL}/cart/remove/${cartItemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      await fetchCart(sessionId);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    try {
      await fetch(`${API_URL}/cart/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cartItemId, quantity: newQuantity })
      });
      await fetchCart(sessionId);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const mergeCart = async () => {
    try {
      await fetch(`${API_URL}/cart/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId })
      });
      await fetchCart(sessionId);
      await fetchOrders();
    } catch (error) {
      console.error('Error merging cart:', error);
    }
  };

  const openSidebar = (tab) => {
    setSidebarTab(tab);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Wishlist operations (Backend synced)
  const toggleWishlist = async (product) => {
    // Optimistic local update
    const isWished = wishlistItems.some(item => item.id === product.id);
    if (!isWished) openSidebar('wishlist');

    try {
      const res = await fetch(`${API_URL}/wishlist/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product.id })
      });
      
      if (res.ok) {
        // Refresh from server to ensure consistency
        fetchWishlist();
      } else {
        // Fallback to local if not logged in
        setWishlistItems(prev => {
          if (isWished) return prev.filter(item => item.id !== product.id);
          return [product, ...prev];
        });
      }
    } catch (error) {
      // Offline/Error fallback
      setWishlistItems(prev => {
        if (isWished) return prev.filter(item => item.id !== product.id);
        return [product, ...prev];
      });
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/wishlist/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId })
      });
      fetchWishlist();
    } catch (e) {
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const clearAll = () => {
    setCartItems([]);
    setWishlistItems([]);
    setOrders([]);
    const newSId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Detailed data purge
    localStorage.removeItem('wishlist_items');
    localStorage.removeItem('checkout_form_data');
    localStorage.removeItem('cart_items');
    
    localStorage.setItem('cart_session_id', newSId);
    setSessionId(newSId);
  };

  const addOrder = (order) => {
    setOrders(prev => [order, ...prev]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      wishlistItems,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      toggleWishlist,
      removeFromWishlist,
      sidebarOpen,
      sidebarTab,
      openSidebar,
      closeSidebar,
      setSidebarTab,
      clearCart,
      clearAll,
      orders,
      addOrder,
      mergeCart,
      fetchCart,
      fetchOrders,
      fetchWishlist,
      syncWishlist,
      syncAndFetchAll
    }}>
      {children}
    </CartContext.Provider>
  );
}
