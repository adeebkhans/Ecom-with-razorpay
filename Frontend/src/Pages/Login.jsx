import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, loginUser, guestLogin } from "../redux/slices/authSlice";

const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      dispatch(registerUser(formData));
    } else {
      dispatch(loginUser({ email: formData.email, password: formData.password }));
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">{isRegistering ? "Register" : "Login"}</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isRegistering && <input type="text" name="name" placeholder="Full Name" required className="border p-2" onChange={handleChange} />}
        <input type="email" name="email" placeholder="Email" required className="border p-2" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required className="border p-2" onChange={handleChange} />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{loading ? "Loading..." : isRegistering ? "Register" : "Login"}</button>
      </form>

      <button onClick={() => dispatch(guestLogin())} className="mt-2 text-blue-500">Login as Guest</button>
      <button onClick={() => setIsRegistering(!isRegistering)} className="mt-2 text-gray-500">
        {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
      </button>
    </div>
  );
};

export default Auth;
