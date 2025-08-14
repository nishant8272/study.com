const { Router } = require('express');
const { contactModel } = require('./db/contact');

const contactRouter = Router();

// Submit contact form
contactRouter.post("/submit", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        msg: "All fields are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        msg: "Please enter a valid email address"
      });
    }

    // Create new contact submission
    const contact = new contactModel({
      name,
      email,
      message
    });

    await contact.save();

    res.status(201).json({
      msg: "Message submitted successfully! We'll get back to you soon.",
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        submittedAt: contact.submittedAt
      }
    });

  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({
      msg: "Failed to submit message. Please try again later."
    });
  }
});

module.exports = { contactRouter };
