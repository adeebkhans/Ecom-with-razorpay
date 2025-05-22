import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, clearCart } from "../redux/slices/cartSlice";
import { Link } from "react-router-dom";

const Cart = () => {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {items.map((item) => (
            <div key={item._id}
              className="flex items-center bg-white p-4 mt-4 shadow-md rounded-md gap-4"
            >
              {/* ✅ Fixed image issue & added proper styling */}
              <div className="w-20 h-20 flex-shrink-0">
                <img
                  src={item.thumbnail || item.image} // ✅ Check both keys
                  alt={item.title}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>

              <div className="flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-red-500">₹{item.price} x {item.quantity}</p>
              </div>

              <button
                onClick={() => dispatch(removeFromCart(item.id))}
                className="bg-red-500 cursor-pointer text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <h2 className="text-xl font-bold mt-4">Total: ₹{total}</h2>
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => dispatch(clearCart())}
              className="bg-gray-500 cursor-pointer text-white px-4 py-2 rounded"
            >
              Clear Cart
            </button>
            <Link to="/checkout" className="bg-green-500 text-white px-4 py-2 rounded">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
