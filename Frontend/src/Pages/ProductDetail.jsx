import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import toast from "react-hot-toast"; // Import toast

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/products/getProduct/${id}`)
      .then(response => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching product:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="text-center mt-20">Loading product details...</p>;
  if (!product) return <p className="text-center mt-20">Product not found</p>;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // Add to Cart with Toast Notification
  const handleAddToCart = () => {
    dispatch(addToCart(product));
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 md:h-auto mt-20">
      <div className="max-w-5xl w-full p-8 bg-white shadow-md rounded-md grid grid-cols-1 md:grid-cols-2 gap-6 p-4">

        {/* Image Slider Section */}
        <div className="w-full">
          <Slider {...settings} className="w-full">
            {product.images?.length > 0 ? (
              product.images.map((img, index) => (
                <div key={index} className="w-full flex justify-center">
                  <img
                    src={img}
                    alt={product.title}
                    className="w-full h-80 object-cover rounded-md"
                  />
                </div>
              ))
            ) : (
              <div className="w-full flex justify-center">
                <img
                  src={product.thumbnail || "https://via.placeholder.com/400"}
                  alt={product.title}
                  className="w-full h-80 object-cover rounded-md"
                />
              </div>
            )}
          </Slider>
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="text-gray-600 mt-2">{product.description}</p>
          <p className="text-red-500 text-xl mt-2">₹{product.price}</p>
          <p>Stock: {product.stock}</p>

          <button
            onClick={handleAddToCart} // Trigger toast on click
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full md:w-auto"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;