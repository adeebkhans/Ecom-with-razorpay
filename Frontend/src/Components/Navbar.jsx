import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";
import { ShoppingCart } from "lucide-react"; // ✅ Using Lucide icons
import { useEffect, useState } from "react";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [animate, setAnimate] = useState(false);

  // ✅ Trigger animation when cart items change
  useEffect(() => {
    if (items.length > 0) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 500); // Animation lasts 500ms
    }
  }, [items.length]);

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">MyShop</Link>

      <div className="flex items-center gap-6">
        {/* ✅ Cart Icon with Animation */}
        <Link to="/cart" className="relative">
          <ShoppingCart className={`w-8 h-8 ${animate ? "animate-bounce" : ""}`} />

          {items.length > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {items.length}
            </span>
          )}
        </Link>

        {/* ✅ User Section */}
        {user ? (
          <div className="flex items-center gap-4">
            <span className="font-medium">{user.name}</span>
            <button
              onClick={() => dispatch(logoutUser())}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              logoutUser
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-blue-500">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
