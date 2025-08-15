import React, { useState } from "react";
import axios from "axios";

function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "user"
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
        let role = form.role|| "user"; 
      const res = await axios.post(`/api/${role}/register`, form, {
        headers: { "Content-Type": "application/json" }
      });
      setMessage(res.data.msg || "Signup successful!");
      // Redirect to login after successful signup
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col  items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded shadow-md  w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
             <select
                        className="w-full px-3 py-2 border rounded"
                        name="role"
                        value={form.role || "user"}
                        onChange={handleChange}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
          <input
            className="w-full px-3 py-2 border rounded"
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            className="w-full px-3 py-2 border rounded"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="w-full px-3 py-2 border rounded"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            className="w-full px-3 py-2 border rounded"
            type="text"
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <input
            className="w-full px-3 py-2 border rounded"
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm text-blue-700">{message}</div>
        )}
        <div className="mt-4 text-center text-sm text-blue-700">
          Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
          </div>
      </div>
    </div>
    );
}

export default Signup;
