const express = require('express');
require('dotenv').config();
const Razorpay = require('razorpay');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const { userAuth } = require('./auth/userAuth');
const { Payment } = require('./db/payment');
const { userModel } = require('./db/user');
const { courseModel } = require('./db/courses');

const razorRouter = express.Router();

// Replace with your Razorpay credentials
const razorpay = new Razorpay({
  key_id: process.env.Razorpay_KEY_ID, // No extra space
  key_secret: process.env.Razorpay_KEY_SECRET, // No extra space
});

console.log('Razorpay instance ready:', !!razorpay);

razorRouter.post('/create-order', userAuth, async (req, res) => {
  try {

    const { amount, currency, receipt, courseId, notes } = req.body;
    console.log('Extracted data:', { amount, currency, receipt, courseId, notes });
    
    // Get user by email from auth middleware
    const user = await userModel.findOne({ email: req.email });
    if (!user) {
      console.log('User not found for email:', req.email);
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    const userId = user._id; // Get user ID from found user

    // Validate course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    // Check if user already purchased this course
    const alreadyPurchased = user.purchasedCourses.some(element => element.courseId.toString() === courseId);
    if (alreadyPurchased) {
      return res.status(400).json({
        error: 'You already own this course'
      });
    }
    // Helper to safely format receipt to <=40 characters
function safeReceipt(receipt) {
  if (!receipt) return `receipt_${Date.now()}`;
  return receipt.length > 40 ? receipt.substring(0, 40) : receipt;
}


    const options = {
      amount: amount * 100, // Convert amount to paise
      currency: currency || 'INR',
      receipt: safeReceipt(receipt) || `receipt_${Date.now()}`,
      notes: {}
    };
    const order = await razorpay.orders.create(options);
    
    // Create payment record in database
    const payment = await Payment.create({
      amount: amount,
      currency: options.currency,
      receipt: options.receipt,
      status: 'pending',
      payment_id: order.id, // Use order ID as payment_id initially
      user_id: userId,
      course_id: courseId,
      payment_method: 'razorpay',
      razorpay_order_id: order.id,
      notes: JSON.stringify(notes) // Convert notes object to string
    });
 
    res.json({
      order: order,
      payment: payment,
      course: course
    });
    
  } catch (error) {
    console.error('=== ERROR in order creation ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      error: 'Error creating order',
      details: error.message
    });
  }
});

// Route to handle payment verification
razorRouter.post('/verify-payment',userAuth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  const secret = razorpay.key_secret;
 

   // Use Razorpay key secret from environment variable
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  try {
    const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);
    if (isValidSignature) {
      // Update the payment record with payment details
      const payment = await Payment.findOneAndUpdate(
        { razorpay_order_id: razorpay_order_id },
        { 
          status: 'completed',
          payment_id: razorpay_payment_id // Update with actual payment ID from Razorpay
        },
        { new: true }
      );

      if (payment) {
        // Automatically add course to user's purchased courses
        const user = await userModel.findById(payment.user_id);
        const course = await courseModel.findById(payment.course_id);
        
        if (user && course) {
          // Check if not already purchased
          const alreadyPurchased = user.purchasedCourses.some(element => element.courseId.toString() === payment.course_id.toString());
          
          if (!alreadyPurchased) {
            await userModel.findByIdAndUpdate(
              payment.user_id,
              { $push: { purchasedCourses: { courseId: payment.course_id } } }
            );
          }
        }

        res.status(200).json({ 
          status: 'ok',
          message: 'Payment verified successfully and course added to purchased courses',
          payment: payment,
          course: course
        });
        console.log("Payment verification successful");
      } else {
        res.status(404).json({ 
          status: 'error',
          message: 'Payment record not found'
        });
      }
    } else {
      res.status(400).json({ status: 'verification_failed' });
      console.log("Payment verification failed");
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ status: 'error', message: 'Error verifying payment' });
  }
});

// Get payment status for a specific course
razorRouter.get('/payment-status/:courseId', userAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      user_id: userId,
      course_id: courseId
    });

    if (!payment) {
      return res.json({
        status: 'no_payment_found'
      });
    }

    res.json({
      status: payment.status,
      payment: payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error fetching payment status'
    });
  }
});

module.exports = {
  paymentRouter: razorRouter
};