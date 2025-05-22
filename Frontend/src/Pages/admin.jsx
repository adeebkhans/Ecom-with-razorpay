import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
    const [secretKey, setSecretKey] = useState("");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState('products');
    const [statusFilter, setStatusFilter] = useState("Paid");
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    const ORDER_STATUSES = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"];

    const [productForm, setProductForm] = useState({
        title: "",
        description: "",
        price: "",
        discountPercentage: "",
        rating: "",
        stock: "",
        thumbnail: "",
        images: ["", ""]
    });

    const validateSecretKey = () => {
        if (!secretKey.trim()) {
            setError("Secret key is required");
            return false;
        }
        setError("");
        return true;
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/products/getAllProducts');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError("Failed to fetch products");
        }
    };

    const fetchOrders = async () => {
        if (!validateSecretKey()) return;

        setIsLoadingOrders(true);
        try {
            const response = await axios.post('http://localhost:3000/api/orders/getAll', {
                status: statusFilter,
                secretKey
            });

            // Ensure we extract orders from the response
            if (response.data && Array.isArray(response.data.orders)) {
                setOrders(response.data.orders);
            } else {
                console.error('Unexpected orders format:', response.data);
                setError("Received invalid orders format from server");
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.response?.data?.message || "Failed to fetch orders");
            setOrders([]);
        } finally {
            setIsLoadingOrders(false);
        }
    };


    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (secretKey) {
            fetchOrders();
        }
    }, [statusFilter]);

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        if (!validateSecretKey()) return;

        try {
            if (selectedProduct) {
                await axios.post(`http://localhost:3000/api/products/admin/update/${selectedProduct._id}`, {
                    ...productForm,
                    secretKey
                });
            } else {
                await axios.post('http://localhost:3000/api/products/admin/add', {
                    ...productForm,
                    secretKey
                });
            }
            fetchProducts();
            setProductForm({
                title: "",
                description: "",
                price: "",
                discountPercentage: "",
                rating: "",
                stock: "",
                thumbnail: "",
                images: ["", ""]
            });
            setSelectedProduct(null);
        } catch (error) {
            console.error('Error submitting product:', error);
            setError(error.response?.data?.message || "Failed to save product");
        }
    };

    const handleOrderStatusUpdate = async (orderId, newStatus) => {
        if (!validateSecretKey()) return;

        try {
            await axios.put(`http://localhost:3000/api/orders/update/${orderId}`, {
                newStatus,
                secretKey
            });
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            setError(error.response?.data?.message || "Failed to update order status");
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            {/* Secret Key Input */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
                <div className="flex gap-4 items-center">
                    <input
                        type="password"
                        placeholder="Enter admin secret key"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b">
                    <div className="flex gap-4">
                        <button
                            className={`px-4 py-2 -mb-px ${activeTab === 'products' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('products')}
                        >
                            Products
                        </button>
                        <button
                            className={`px-4 py-2 -mb-px ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Orders
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Tab Content */}
            {activeTab === 'products' && (
                <div>
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <form onSubmit={handleProductSubmit} className="space-y-4">
                            <input
                                placeholder="Title"
                                value={productForm.title}
                                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={productForm.description}
                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                                rows="3"
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={productForm.price}
                                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                    className="px-4 py-2 border rounded-lg"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Discount %"
                                    value={productForm.discountPercentage}
                                    onChange={(e) => setProductForm({ ...productForm, discountPercentage: e.target.value })}
                                    className="px-4 py-2 border rounded-lg"
                                />
                                <input
                                    type="number"
                                    placeholder="Rating"
                                    value={productForm.rating}
                                    onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })}
                                    className="px-4 py-2 border rounded-lg"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                />
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    value={productForm.stock}
                                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                    className="px-4 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <input
                                placeholder="Thumbnail URL"
                                value={productForm.thumbnail}
                                onChange={(e) => setProductForm({ ...productForm, thumbnail: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            />
                            {productForm.images.map((img, idx) => (
                                <input
                                    key={idx}
                                    placeholder={`Image URL ${idx + 1}`}
                                    value={img}
                                    onChange={(e) => {
                                        const newImages = [...productForm.images];
                                        newImages[idx] = e.target.value;
                                        setProductForm({ ...productForm, images: newImages });
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            ))}
                            <button
                                type="submit"
                                disabled={!secretKey}
                                className={`px-6 py-2 rounded-lg text-white ${!secretKey ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                            >
                                {selectedProduct ? 'Update Product' : 'Add Product'}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Product List</h3>
                        <div className="space-y-4">
                            {products.map(product => (
                                <div
                                    key={product._id}
                                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50"
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setProductForm({
                                            title: product.title,
                                            description: product.description,
                                            price: product.price,
                                            discountPercentage: product.discountPercentage,
                                            rating: product.rating,
                                            stock: product.stock,
                                            thumbnail: product.thumbnail,
                                            images: product.images
                                        });
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">{product.title}</h4>
                                            <p className="text-sm text-gray-500">ID: {product._id}</p>
                                        </div>
                                        <p className="font-semibold">${product.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Tab Content */}
            {activeTab === 'orders' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Orders Management</h2>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={fetchOrders}
                                disabled={!secretKey || isLoadingOrders}
                                className={`px-4 py-2 rounded-lg ${!secretKey || isLoadingOrders
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                            >
                                {isLoadingOrders ? 'Loading...' : 'Refresh Orders'}
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Filter by status:</span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    {ORDER_STATUSES.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                No orders found with status: {statusFilter}
                            </p>
                        ) : (
                            orders.map(order => (
                                <div key={order._id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Order ID: {order?._id}</p>
                                            <p className="text-sm text-gray-500">Status: {order?.status}</p>
                                            <p className="text-sm text-gray-500">Total: ${order?.totalAmount}</p>
                                            <p className="text-sm text-gray-500">Payment ID: {order?.paymentId}</p>
                                            <p className="text-sm text-gray-500">
                                                Created At: {order?.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                                            </p>

                                            <p className="text-sm text-gray-500">Customer Info:</p>
                                            <ul className="text-sm text-gray-600">
                                                <li><strong>Name:</strong> {order?.shippingAddress?.fullName || "N/A"}</li>
                                                <li><strong>Email:</strong> {order?.shippingAddress?.email || "N/A"}</li>
                                                <li><strong>Phone:</strong> {order?.shippingAddress?.phone || "N/A"}</li>
                                                <li>
                                                    <strong>Address:</strong>
                                                    {order?.shippingAddress
                                                        ? `${order.shippingAddress.address || "N/A"}, ${order.shippingAddress.city || "N/A"}, 
          ${order.shippingAddress.state || "N/A"}, ${order.shippingAddress.zipCode || "N/A"}`
                                                        : "N/A"}
                                                </li>
                                            </ul>
                                        </div>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                                            disabled={!secretKey}
                                            className="px-4 py-2 border rounded-lg"
                                        >
                                            {ORDER_STATUSES.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;