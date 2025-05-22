import { useLocation, Link } from "react-router-dom";

const OrderConfirmationPage = () => {
  const location = useLocation();
  const { orderId, totalAmount } = location.state || {}; // Get order details

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-md text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-600">Order Confirmed!</h1>
      <p className="text-lg text-gray-700 mb-4">
        Thank you for your order. Your payment of ₹{totalAmount} was successful.
      </p>
      {orderId && (
        <p className="text-gray-700 mb-4">
          Order ID: <span className="font-semibold">{orderId}</span>
        </p>
      )}
      <p className="text-gray-700 mb-6">You will receive an email confirmation shortly.</p>
      <Link to="/" className="inline-block bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors">
        Back to Homepage
      </Link>
    </div>
  );
};

export default OrderConfirmationPage;
