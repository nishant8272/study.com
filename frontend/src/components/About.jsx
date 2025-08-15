import React, { useState } from "react";
import axios from "axios";

function About() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post('/api/contact/submit', form);
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" }); // Reset form
      console.log('Contact form submitted:', response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit message. Please try again.');
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-4 text-green-700 text-center">About Study.com</h2>
        <p className="mb-6 text-gray-700 text-center">
          Welcome to Study.com! We are dedicated to providing quality online courses to help you learn and grow. 
          If you have any questions, suggestions, or want to connect with us, please fill out the form below.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <textarea
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            required
            disabled={loading}
          />
          
          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded transition ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white font-medium`}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
        
        {submitted && (
          <div className="mt-4 text-center text-green-600 font-medium bg-green-50 p-3 rounded border border-green-200">
            🎉 Thank you for reaching out! We will get back to you soon.
            <button
              onClick={() => setSubmitted(false)}
              className="block mx-auto mt-2 text-sm text-green-700 underline hover:text-green-800"
            >
              Send another message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default About;