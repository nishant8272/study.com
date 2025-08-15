import React, { useState } from "react";
import axios from "axios";

function Login() {
    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
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
            const role = form.role|| "user"; 
            
        
            const res = await axios.post(`/api/${role}/login`, form, {
                headers: { "Content-Type": "application/json" }
            });
            setMessage(res.data.msg || "Login successful!");
            localStorage.setItem(`${role}Token`, res.data.token);
            // Redirect to appropriate dashboard after successful login
            setTimeout(() => {
                if (role === 'admin') {
                    window.location.href = '/admin-panel';
                } else {
                    window.location.href = '/user-dashboard';
                }
            }, 1000);
        } catch (err) {
            setMessage(err.response?.data?.msg || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Login</h2>
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
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="w-full px-3 py-2 border rounded"
                        type="text"
                        name="username"
                        placeholder="username"
                        value={form.username}
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
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                {message && (
                    <div className="mt-4 text-center text-sm text-blue-700">{message}</div>

                )}
            </div>
            <div className="mt-4 text-center text-sm text-blue-700">
                Don't have an account? <a href="/signup" className="text-blue-500 hover:underline">Sign Up</a>
            </div>
        </div>
    );
}

export default Login;
