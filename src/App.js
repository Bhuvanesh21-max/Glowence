import React, { useState, useEffect } from 'react';

const App = () => {
  // Navigation & Role State
  const [currentView, setCurrentView] = useState('home'); 
  const [userRole, setUserRole] = useState('guest'); // 'guest', 'customer', 'admin'
  const [customerInfo, setCustomerInfo] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminPassword, setAdminPassword] = useState('1234'); // Customizable password state

  // Dynamic Products State (Catalog)
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: "Modern Chandelier", 
      price: "₹1", 
      description: "A breathtaking modern chandelier featuring brushed brass and LED crystal rings. Perfect for high ceilings and modern dining rooms.",
      image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=400&q=80",
      reviews: [
        { id: 101, author: "Rajesh K.", text: "Absolutely stunning! Changes the whole look of my living room." }
      ]
    },
    { 
      id: 2, 
      name: "Amber Pendant Light", 
      price: "₹1", 
      description: "Hand-blown amber glass pendant light. Provides a warm, vintage glow suitable for kitchen islands or cozy cafes.",
      image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80",
      reviews: []
    },
    { 
      id: 3, 
      name: "Minimalist Wall Sconce", 
      price: "₹1", 
      description: "Matte black wall sconce with a warm LED glow. Perfect for hallways, vanity mirrors, and bedside reading.",
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80",
      reviews: []
    }
  ]);

  // Orders State
  const [orders, setOrders] = useState([
    {
      orderId: 'GLW-847291',
      product: products[1], 
      date: 'Sept 25, 2026',
      status: 'Shipped', 
      location: 'In Transit - Chennai Hub',
      expectedDelivery: 'Sept 29, 2026',
      customer: 'guest'
    }
  ]);

  // Admin Dashboard State - Products
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Customer Review State
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewText, setReviewText] = useState('');

  // Payment Gateway State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); 
  const [paymentMethod, setPaymentMethod] = useState('upi'); 
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); 

  // --- BACKEND API SYNCHRONIZATION ---
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => { if (data.length > 0) setProducts(data); })
      .catch(err => console.log('Error fetching products:', err));

    fetch('http://localhost:5000/api/orders')
      .then(res => res.json())
      .then(data => { if (data.length > 0) setOrders(data); })
      .catch(err => console.log('Error fetching orders:', err));
  }, []);

  // --- AUTHENTICATION ---
  const handleAdminLogin = () => {
    const password = window.prompt(`Admin Access: Enter password (hint: ${adminPassword})`);
    if (password === adminPassword) {
      setUserRole('admin');
      setCurrentView('admin');
    } else if (password !== null) {
      alert("Incorrect admin password!");
    }
  };

  const handleCustomerLogin = (e) => {
    e.preventDefault();
    setUserRole('customer');
    setCustomerInfo({ name: 'sabeesh', email: 'sabeesh@example.com' });
    setCurrentView('catalog');
    alert("Logged in successfully! You can now place orders.");
  };

  const handleLogout = () => {
    setUserRole('guest');
    setCustomerInfo(null);
    setCurrentView('home');
  };

  // --- ADMIN FUNCTIONS ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Please select an image first!");
    
    const formData = new FormData();
    formData.append('name', productName);
    formData.append('price', productPrice);
    formData.append('description', productDescription);
    formData.append('image', imageFile);

    fetch('http://localhost:5000/api/products', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(newProduct => {
      setProducts([...products, newProduct]);
      alert(`Success! ${productName} added to the catalog.`);
      setImagePreview(null);
      setProductName('');
      setProductPrice('');
      setProductDescription('');
      setImageFile(null);
    })
    .catch(err => alert("Failed to upload product to server"));
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE'
      })
      .then(res => res.json())
      .then(() => {
        setProducts(products.filter(p => p.id !== productId));
        alert("Product deleted successfully.");
      })
      .catch(err => alert("Failed to delete product"));
    }
  };

  const handleUpdatePrice = (productId) => {
    const newPrice = window.prompt("Enter new price:");
    if (newPrice) {
      fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice })
      })
      .then(res => res.json())
      .then(() => {
        setProducts(products.map(p => p.id === productId ? { ...p, price: newPrice } : p));
        alert("Product price updated successfully.");
      })
      .catch(err => alert("Failed to update price"));
    }
  };

  const handleChangeAdminPassword = () => {
    const newPass = window.prompt("Enter new admin password:");
    if (newPass && newPass.trim() !== "") {
      setAdminPassword(newPass);
      alert("Admin password updated successfully!");
    }
  };

  const exportToExcel = () => {
    const headers = ['Order ID', 'Product Name', 'Price', 'Order Date', 'Status', 'Current Location', 'Expected Delivery'];
    const csvRows = orders.map(order => [
      order.orderId, `"${order.product.name}"`, `"${order.product.price}"`, `"${order.date}"`, order.status, `"${order.location}"`, `"${order.expectedDelivery}"`
    ]);
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Glowence_Store_Orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CUSTOMER FUNCTIONS ---
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const newReview = { id: Date.now(), author: reviewAuthor, text: reviewText };
    const updatedProducts = products.map(p => p.id === selectedProduct.id ? { ...p, reviews: [...p.reviews, newReview] } : p);
    setProducts(updatedProducts);
    setSelectedProduct({ ...selectedProduct, reviews: [...selectedProduct.reviews, newReview] });
    setReviewAuthor('');
    setReviewText('');
  };

  const viewProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    window.scrollTo(0, 0);
  };

  const trackOrder = (order) => {
    setSelectedOrder(order);
    setCurrentView('tracking');
    window.scrollTo(0, 0);
  };

  // --- PAYMENT & ORDER CREATION ---
  const handleBuyClick = () => {
    if (userRole === 'guest') {
      alert("Please login or create an account to place an order.");
      setCurrentView('account');
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setPaymentStatus('processing');
    
    const newOrder = {
      orderId: `GLW-${Math.floor(100000 + Math.random() * 900000)}`,
      product: selectedProduct,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Order Placed',
      location: 'Processing at Warehouse',
      expectedDelivery: 'Expected in 4-5 days',
      customer: customerInfo?.name || 'guest'
    };

    fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).catch(err => console.log('Error saving order to backend:', err));

    if (paymentMethod === 'upi') {
      const numericAmount = selectedProduct.price.replace(/[^0-9.]/g, '');
      const merchantUpiId = "sabeesh@upi"; 
      const merchantName = "Glowence Lighting";
      window.location.href = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${numericAmount}&cu=INR`;
    }
    
    setTimeout(() => {
      setPaymentStatus('success');
      setOrders([newOrder, ...orders]);
      
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentStatus('idle');
        setPaymentMethod('upi');
        setCurrentView('orders');
      }, 1500);
    }, 4000);
  };

  const getSuggestedProducts = () => {
    if (!selectedProduct) return [];
    return products.filter(p => p.id !== selectedProduct.id).slice(0, 4); 
  };

  const trackingSteps = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const getStepStatus = (currentStatus, stepName) => {
    const currentIndex = trackingSteps.indexOf(currentStatus);
    const stepIndex = trackingSteps.indexOf(stepName);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1a1a24] via-[#2a2a35] to-[#4a4a55] text-[#E0E0E0] font-['Inter'] relative">
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="flex flex-col md:flex-row justify-between items-center p-4 sm:p-6 max-w-7xl mx-auto border-b border-gray-700 gap-4 md:gap-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
          <img src="/logo.png" alt="Glowence Logo" className="w-10 h-10 object-contain" />
          <h1 className="text-2xl font-bold font-['Poppins'] text-white tracking-wider">GLOWENCE</h1>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
          <button onClick={() => setCurrentView('home')} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${currentView === 'home' ? 'bg-[#FFC107] text-black' : 'text-gray-300 hover:text-white'}`}>Home</button>
          <button onClick={() => setCurrentView('catalog')} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${currentView === 'catalog' ? 'bg-[#FFC107] text-black' : 'text-gray-300 hover:text-white'}`}>Catalog</button>
          <button onClick={() => setCurrentView('orders')} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${currentView === 'orders' || currentView === 'tracking' ? 'bg-[#FFC107] text-black' : 'text-gray-300 hover:text-white'}`}>Orders</button>
          <button onClick={() => setCurrentView('about')} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${currentView === 'about' ? 'bg-[#FFC107] text-black' : 'text-gray-300 hover:text-white'}`}>About Us</button>
          
          {userRole === 'admin' && (
            <button onClick={() => setCurrentView('admin')} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${currentView === 'admin' ? 'bg-[#FFC107] text-black' : 'border border-[#FFC107] text-[#FFC107]'}`}>Admin Panel</button>
          )}
          
          <div className="border-l border-gray-600 pl-4 ml-2 flex flex-wrap gap-2">
            {userRole === 'guest' ? (
              <>
                <button onClick={() => setCurrentView('account')} className="text-sm text-gray-300 hover:text-[#FFC107] transition-colors">Login</button>
                <button onClick={handleAdminLogin} className="text-sm text-gray-500 hover:text-white transition-colors">Admin</button>
              </>
            ) : (
              <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 transition-colors">Logout ({userRole})</button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-4 sm:p-8 max-w-7xl mx-auto">
        
        {/* --- VIEW: HOME --- */}
        {currentView === 'home' && (
          <div className="flex flex-col items-center justify-center text-center mt-10 sm:mt-20">
            <h1 className="text-4xl sm:text-6xl font-bold font-['Poppins'] text-white mb-6">Glowence On Your Space</h1>
            <p className="text-lg text-gray-300 max-w-2xl mb-10">Discover our exclusive collection of modern lighting solutions designed to transform your home into a masterpiece</p>
            <button onClick={() => setCurrentView('catalog')} className="bg-[#FFC107] text-black font-bold text-lg px-8 py-4 rounded-full shadow-[0_0_20px_rgba(255,193,7,0.4)] hover:scale-105 transition-transform">
              Shop the Catalog
            </button>
          </div>
        )}

        {/* --- VIEW: ABOUT US --- */}
        {currentView === 'about' && (
          <div className="max-w-4xl mx-auto mt-8 bg-[#2a2a35] p-8 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-3xl font-bold font-['Poppins'] text-white mb-6">Architectural Lighting Supply for Your Projects </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
            Glowence Lighting Solutions transforms spaces
into experiences with precision-crafted, high-
performance lighting designs. We combine
aesthetics, energy efficiency, and cutting-edge
technology to deliver lighting that elevates every
project. From concept to installation, our team
ensures seamless execution tailored to architects,
builders, and premium clients. With Glowence,
you don’t just light a space—you define its mood,
value, and impact.
            </p>
          </div>
        )}

        {/* --- VIEW: ACCOUNT / LOGIN --- */}
        {currentView === 'account' && (
          <div className="max-w-md mx-auto mt-10 bg-[#2a2a35] p-8 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold font-['Poppins'] text-white mb-6 text-center">Customer Login</h2>
            <form onSubmit={handleCustomerLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <input type="email" required placeholder="Enter any email" className="w-full p-3 rounded bg-[#1e1e28] border border-gray-600 text-white outline-none focus:border-[#FFC107]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input type="password" required placeholder="Enter any password" className="w-full p-3 rounded bg-[#1e1e28] border border-gray-600 text-white outline-none focus:border-[#FFC107]" />
              </div>
              <button type="submit" className="w-full bg-[#FFC107] text-black font-bold py-3 rounded hover:bg-yellow-400">Login to Continue</button>
            </form>
          </div>
        )}

        {/* --- VIEW: CATALOG --- */}
        {currentView === 'catalog' && (
          <div>
            <h2 className="text-3xl sm:text-4xl font-['Poppins'] font-bold text-white mb-8 sm:mb-10 text-center mt-4 sm:mt-8">Full Catalog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} onClick={() => viewProduct(product)} className="bg-black bg-opacity-20 rounded-lg overflow-hidden border border-gray-700 group cursor-pointer hover:border-[#FFC107] transition-all duration-300 flex flex-col">
                  <div className="h-56 overflow-hidden relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4 text-center flex-1 flex flex-col justify-between">
                    <h4 className="text-sm font-['Poppins'] font-semibold text-gray-200">{product.name}</h4>
                    <div>
                      <span className="text-[#FFC107] font-bold mt-2 block">{product.price}</span>
                      <span className="text-xs text-gray-400 mt-2 block">{product.reviews?.length || 0} Review(s)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW: PRODUCT DETAILS --- */}
        {currentView === 'product' && selectedProduct && (
          <div className="max-w-4xl mx-auto mt-4 sm:mt-8">
            <button onClick={() => setCurrentView('catalog')} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">← Back to Catalog</button>
            <div className="bg-[#2a2a35] rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover min-h-[300px]" />
              </div>
              <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-white">{selectedProduct.name}</h2>
                  <p className="text-xl sm:text-2xl text-[#FFC107] font-bold mt-2">{selectedProduct.price}</p>
                  <p className="text-gray-300 mt-6 leading-relaxed">{selectedProduct.description}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button onClick={handleBuyClick} className="flex-1 bg-[#FFC107] text-black font-bold py-3 rounded hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(255,193,7,0.4)]">
                    {userRole === 'guest' ? 'Login to Buy' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="mt-8 sm:mt-12 bg-[#1e1e28] p-6 sm:p-8 rounded-xl border border-gray-700">
              <h3 className="text-xl sm:text-2xl font-bold font-['Poppins'] text-white mb-6">Customer Reviews</h3>
              <div className="space-y-4 mb-10">
                {(!selectedProduct.reviews || selectedProduct.reviews.length === 0) ? (
                  <p className="text-gray-400 italic">No reviews yet. Be the first to share your thoughts!</p>
                ) : (
                  selectedProduct.reviews.map(review => (
                    <div key={review.id} className="bg-[#2a2a35] p-4 rounded-lg border border-gray-600">
                      <p className="font-bold text-[#FFC107]">{review.author}</p>
                      <p className="text-gray-300">{review.text}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <input type="text" placeholder="Your Name" value={reviewAuthor} onChange={(e) => setReviewAuthor(e.target.value)} required className="w-full md:w-1/2 p-3 rounded bg-[#2a2a35] border border-gray-600 text-white" />
                <textarea placeholder="Write a review..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} required rows="3" className="w-full p-3 rounded bg-[#2a2a35] border border-gray-600 text-white" />
                <button type="submit" className="bg-[#FFC107] text-black px-6 py-2 rounded font-bold">Submit Review</button>
              </form>
            </div>
          </div>
        )}

        {/* --- VIEW: MY ORDERS --- */}
        {currentView === 'orders' && (
          <div className="max-w-4xl mx-auto mt-4 sm:mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-white mb-6 sm:mb-8">My Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-400">No orders found.</p>
            ) : (
              <div className="space-y-6">
                {orders.map((order, idx) => (
                  <div key={idx} className="bg-[#2a2a35] p-4 sm:p-6 rounded-xl border border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">{order.product.name}</h3>
                      <p className="text-gray-400 text-sm">ID: {order.orderId} • {order.date}</p>
                    </div>
                    <button onClick={() => trackOrder(order)} className="border border-[#FFC107] text-[#FFC107] px-4 py-2 rounded">Track Parcel</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: PARCEL TRACKING --- */}
        {currentView === 'tracking' && selectedOrder && (
          <div className="max-w-3xl mx-auto mt-4 sm:mt-8">
            <button onClick={() => setCurrentView('orders')} className="text-gray-400 hover:text-white mb-6">← Back to Orders</button>
            <div className="bg-[#2a2a35] p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Tracking Order: {selectedOrder.orderId}</h3>
              <p className="text-[#FFC107] font-bold mb-2">Status: {selectedOrder.status}</p>
              <p className="text-gray-300">Expected Delivery: {selectedOrder.expectedDelivery}</p>
            </div>
          </div>
        )}

        {/* --- VIEW: ADMIN DASHBOARD --- */}
        {currentView === 'admin' && userRole === 'admin' && (
          <div className="max-w-6xl mx-auto mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Upload Product Panel */}
            <div className="bg-[#2a2a35] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-700 h-fit">
              <h2 className="text-xl sm:text-2xl font-bold font-['Poppins'] mb-2 text-[#FFC107]">Upload Catalog Item</h2>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} required className="w-full p-3 rounded bg-[#1e1e28] border border-gray-600 text-white" />
                <input type="text" placeholder="Price (e.g. ₹4,500)" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} required className="w-full p-3 rounded bg-[#1e1e28] border border-gray-600 text-white" />
                <textarea placeholder="Product Description..." value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required rows="4" className="w-full p-3 rounded bg-[#1e1e28] border border-gray-600 text-white resize-none" />
                <input type="file" accept="image/*" onChange={handleImageChange} required className="w-full p-3 text-xs rounded bg-[#1e1e28] border border-gray-600 text-gray-400 cursor-pointer" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="max-h-32 object-contain rounded" />}
                <button type="submit" className="w-full bg-[#FFC107] text-black font-bold py-3 rounded">Save to Catalog</button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <button onClick={handleChangeAdminPassword} className="w-full bg-gray-700 text-white font-bold py-2 rounded hover:bg-gray-600">Change Admin Password</button>
              </div>
            </div>

            {/* Manage Existing Products (Edit Price / Delete) */}
            <div className="bg-[#2a2a35] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-700 h-fit">
              <h2 className="text-xl sm:text-2xl font-bold font-['Poppins'] mb-2 text-[#FFC107]">Manage Products</h2>
              <div className="space-y-4 max-h-[450px] overflow-y-auto">
                {products.map(product => (
                  <div key={product.id} className="bg-[#1e1e28] p-4 rounded-lg border border-gray-600 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                      <div>
                        <h4 className="text-white font-bold text-sm">{product.name}</h4>
                        <span className="text-[#FFC107] text-xs font-bold">{product.price}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdatePrice(product.id)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-500">Edit Price</button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-500">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* --- SECURE PAYMENT MODAL --- */}
      {showPaymentModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a35] max-w-md w-full rounded-2xl shadow-2xl border border-gray-600 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Secure Checkout</h3>
            <p className="text-[#FFC107] font-bold mb-4">{selectedProduct.name} - {selectedProduct.price}</p>
            {paymentStatus === 'idle' && (
              <form onSubmit={handlePaymentSubmit}>
                <button type="submit" className="w-full bg-[#FFC107] text-black font-bold py-3 rounded">Pay Now</button>
              </form>
            )}
            {paymentStatus === 'processing' && <p className="text-white text-center">Processing payment...</p>}
            {paymentStatus === 'success' && <p className="text-green-400 text-center font-bold">Payment Successful!</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;