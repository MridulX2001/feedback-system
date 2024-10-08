import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginRegister() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate(); // React Router's navigate function

  // Function to toggle between login and register forms
  const toggleForm = () => {
    setIsRegister(!isRegister);
    setError("");
    setSuccess("");
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
      setSuccess("Login successful!");
      setError("");
      localStorage.setItem("token", res.data.token); // Save JWT in localStorage
      navigate("/home"); // Redirect to home page after successful login
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed.");
      setSuccess("");
    }
  };

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        name,
        email,
        password,
      });
      setSuccess("Registration successful!");
      setError("");
      localStorage.setItem("token", res.data.token); // Save JWT in localStorage
      navigate("/home"); // Redirect to home page after successful registration
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed.");
      setSuccess("");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-100">
      <div className="bg-white shadow-lg rounded-lg px-10 py-12 w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-8">
          {isRegister ? "Create an Account" : "Welcome Back"}
        </h2>

        {error && (
          <p className="text-red-500 text-center mb-4">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-500 text-center mb-4">
            {success}
          </p>
        )}

        {isRegister ? (
          <form onSubmit={handleRegister}>
            {/* Register Form */}
            <div className="mb-6">
              <label className="block text-blue-700 font-semibold mb-2" htmlFor="name">
                Name
              </label>
              <input
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)} // Update name state
              />
            </div>

            <div className="mb-6">
              <label className="block text-blue-700 font-semibold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update email state
              />
            </div>

            <div className="mb-6">
              <label className="block text-blue-700 font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update password state
              />
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              type="submit"
            >
              Register
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            {/* Login Form */}
            <div className="mb-6">
              <label className="block text-blue-700 font-semibold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update email state
              />
            </div>

            <div className="mb-6">
              <label className="block text-blue-700 font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update password state
              />
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              type="submit"
            >
              Sign In
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          {isRegister ? (
            <p className="text-blue-700">
              Already have an account?{" "}
              <button
                onClick={toggleForm}
                className="text-blue-600 font-bold hover:text-blue-800"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-blue-700">
              Don't have an account?{" "}
              <button
                onClick={toggleForm}
                className="text-blue-600 font-bold hover:text-blue-800"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;
