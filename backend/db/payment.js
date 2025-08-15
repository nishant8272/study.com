const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR']
    },
    receipt: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    payment_id: {
        type: String,
        required: true,
        unique: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses',
        required: true
    },
    payment_method: {
        type: String,
        required: true,
        default: 'razorpay',
        enum: ['razorpay', 'stripe', 'paypal', 'card']
    },
    razorpay_order_id: {
        type: String,
        unique: true,
        sparse: true
    },
    notes: {
        type:String,
        required :false,
    },
}, {
    timestamps: true
})

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = {
    Payment
}