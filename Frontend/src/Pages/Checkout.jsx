import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OrderConfirmationPage from '../Pages/OrderConfirmationPage'; // Adjust path as needed

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "", 
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Ensure total amount calculation is correct
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    try {
      // Create Order Request
      const orderData = {
        totalAmount,
        verifiedCart: items.map((item) => ({
          productId: item._id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          discountedPrice: item.discountedPrice,
          total: item.price * item.quantity,
        })),
        paymentMethod: "razorpay",
      };

      const orderResponse = await axios.post("http://localhost:3000/api/payment/create-order", orderData, {
        withCredentials: true, // Ensures cookies (JWT) are sent
      });

      const { orderId, amount, currency } = orderResponse.data;
      console.log(orderResponse.data)

      // Razorpay Options
      const options = {
        key: "rzp_test_KSH67HjrDDxLq0", // Replace with your Razorpay key - VERIFY THIS!
        amount: amount * 100,
        currency: currency,
        name: "Your Shop",
        description: "Order Payment",
        order_id: orderId, // Ensure order_id is passed
        handler: async function (response) {
          console.log("Razorpay Response:", response); // IMPORTANT: Check browser console for this output

          // Ensure payment details exist before sending request
          if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
            alert("Payment details are missing!");
            return;
          }

          const verifyData = {
            razorpay_order_id: response.razorpay_order_id, // Include order ID
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            verifiedCart: items.map((item) => ({
              productId: item._id,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
            })),
            totalAmount,
            userId: "user_id_placeholder", // Replace with actual user ID
            shippingAddress: {
              fullName: formData.fullName,
              email: formData.email,  // **Ensure email is included**
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
            },  
          };

          try {
            const verifyResponse = await axios.post("http://localhost:3000/api/payment/verify", verifyData, {
              withCredentials: true,
            });

            if (verifyResponse.data.success) {
              alert("Payment successful! Order placed.");
              dispatch(clearCart());
              setPaymentSuccess(true);
              navigate("/order-confirmation", { // Pass orderId and totalAmount in state
                state: {
                  orderId: verifyResponse.data.orderId, // Assuming orderId is returned in verifyResponse
                  totalAmount: totalAmount,
                },
                replace: true,
              });
            } else {
              alert("Payment verification failed.");
            }
          } catch (error) {
            console.error("Verification Error:", error.response?.data || error.message);
            alert("Something went wrong during verification. Please try again.");
          }
        },
        prefill: {
          name: formData.fullName,
          email: "user@example.com",
          contact: formData.phone,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error.response?.data || error.message);
      alert("Something went wrong. Please try again.");
    }
  };

  return paymentSuccess ? (
    <OrderConfirmationPage /> // Render the OrderConfirmationPage component
  ) : (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
        <input type="text" name="fullName" placeholder="Full Name" required className="border p-2" onChange={handleChange} />
        <input type="text" name="email" placeholder="Email" required className="border p-2" onChange={handleChange} />
        <input type="tel" name="phone" placeholder="Phone Number" required className="border p-2" onChange={handleChange} />
        <input type="text" name="address" placeholder="Address" required className="border p-2" onChange={handleChange} />
        <input type="text" name="city" placeholder="City" required className="border p-2" onChange={handleChange} />
        <input type="text" name="state" placeholder="State" required className="border p-2" onChange={handleChange} />
        <input type="text" name="zipCode" placeholder="ZIP Code" required className="border p-2" onChange={handleChange} />
        <button type="button" onClick={handlePayment} className="bg-blue-500 text-white px-4 py-2 rounded">
          Pay ₹{totalAmount} with Razorpay
        </button>
      </form>
    </div>
  );
};

export default Checkout;