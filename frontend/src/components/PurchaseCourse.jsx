import React, { useState } from 'react';
import axios from 'axios';

// Make sure Razorpay is available globally
const Razorpay = window.Razorpay;

function PurchaseCourse({ course, onPurchaseComplete, className = "" }) {
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState('');

  const handlePurchase = async () => {
    setPurchasing(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setMessage('Please login to purchase courses');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      console.log('Creating order for course:', course);
      console.log('Order data:', {
        amount: course.price,
        currency: 'INR',
        receipt: `receipt_${course._id}_${Date.now()}`,
        courseId: course._id,
        notes: {
          courseTitle: course.title,
          courseDescription: course.description
        }
      });

      // Create Razorpay order through backend
      const orderResponse = await axios.post('/api/razorpay/create-order', {
        amount: course.price,
        currency: 'INR',
        receipt: `receipt_${course._id}_${Date.now()}`,
        courseId: course._id,
        notes: {
          courseTitle: course.title,
          courseDescription: course.description
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Order response:', orderResponse.data);

      const { order, payment } = orderResponse.data;

      if (!order || !order.id) {
        throw new Error('Invalid order response from server');
      }

      // Check if Razorpay is available
      if (!Razorpay) {
        throw new Error('Razorpay is not loaded. Please refresh the page and try again.');
      }
      // Open Razorpay Checkout
      const options = {
        key: "rzp_test_r5RBHUVwirLsTx", // Use your Razorpay key ID
        amount: order.amount,
        currency: order.currency,
        name: 'Study.com',
        description: `Purchase: ${course.title}`,
        order_id: order.id,
        prefill: {
          name: 'Student',
          email: 'student@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#10B981'
        },
        handler: async function (response) {
          try {
            console.log('Payment successful:', response);
            
            // Verify payment with backend
            const verifyResponse = await axios.post('/api/razorpay/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            },{
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (verifyResponse.data.status === 'ok') {
              setMessage('🎉 Payment successful! Course added to your library!');
              
              // Call the purchase complete callback
              if (onPurchaseComplete) {
                onPurchaseComplete(course);
              }
              
              // Refresh the page or redirect after a short delay
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } else {
              setMessage('❌ Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setMessage('❌ Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setMessage('Payment cancelled. You can try again anytime.');
            setPurchasing(false);
          }
        }
      };

      console.log('Opening Razorpay with options:', options);
      const rzp = new Razorpay(options);
      rzp.open();
      
    } catch (err) {
      console.error('Purchase error:', err);
      
      if (err.response?.status === 401) {
        setMessage('Session expired. Please login again.');
        localStorage.removeItem('userToken');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (err.response?.data?.error === 'You already own this course') {
        setMessage('✅ You already own this course!');
      } else if (err.response?.data?.error) {
        setMessage('❌ ' + err.response.data.error);
      } else if (err.message) {
        setMessage('❌ ' + err.message);
      } else {
        setMessage('❌ Failed to create payment order. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className={`purchase-course-component ${className}`}>
      <button
        onClick={handlePurchase}
        disabled={purchasing}
        className={`${className.includes('w-full') ? 'w-full' : 'w-full'} bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105`}
      >
        {purchasing ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        ) : (
          <>
            <span className="mr-2">💳</span>
            Purchase Course - ${course.price}
          </>
        )}
      </button>
      
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          message.includes('🎉') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : message.includes('❌')
            ? 'bg-red-100 text-red-800 border border-red-200'
            : message.includes('✅')
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default PurchaseCourse;
