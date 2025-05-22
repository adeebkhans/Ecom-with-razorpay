/* eslint-disable react/prop-types */
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast"; // Import toast

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    toast.success(`${product.title} added to cart! 🛒`, {
      position: "top-right",
      duration: 2000,
    });
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-md">
      {/* Image Container with fixed size */}
      <div className="w-full h-48 overflow-hidden rounded-md">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>

      <h2 className="text-lg font-semibold mt-2">{product.title}</h2>
      <p className="text-red-500">₹{product.price}</p>
      <p>Stock: {product.stock}</p>

      <div className="flex justify-between mt-2">
        <Link to={`/product/${product._id}`} className="text-blue-500">
          View
        </Link>
        <button
          onClick={handleAddToCart}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
