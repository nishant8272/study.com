# Course Selling App - Backend API Documentation

## Overview
This is the backend API for a course selling application built with Node.js, Express, and MongoDB. The API supports user registration, course management, payment processing, and admin functionalities.

## Base URL
```
http://localhost:3000
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## User Routes (`/user`)

### 1. User Registration
**POST** `/user/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "msg": "user registered successfully",
  "details": {
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "purchasedCourses": []
  }
}
```

### 2. User Login
**POST** `/user/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "msg": "user login successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get All Courses (Protected)
**GET** `/user/courses`

Get all available courses. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "msg": "all courses available for user",
  "courses": [
    {
      "_id": "course_id",
      "title": "React for Beginners",
      "description": "Learn React from scratch",
      "price": 99.99,
      "image": "course_image_url"
    }
  ]
}
```

### 4. Get Course by ID (Protected)
**GET** `/user/course/:id`

Get a specific course by its ID. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "msg": "searched course",
  "course": {
    "_id": "course_id",
    "title": "React for Beginners",
    "description": "Learn React from scratch",
    "price": 99.99,
    "image": "course_image_url"
  }
}
```

### 5. Purchase Course (Protected)
**POST** `/user/purchase/:id`

Purchase a course. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "msg": "course purchased successfully",
  "purchasedCourse": {
    "_id": "course_id",
    "title": "React for Beginners",
    "description": "Learn React from scratch",
    "price": 99.99,
    "image": "course_image_url"
  }
}
```

### 6. Get Purchased Courses (Protected)
**GET** `/user/purchasedCourses`

Get all courses purchased by the user. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "msg": "purchased courses found",
  "purchasedCourses": [
    {
      "_id": "course_id",
      "title": "React for Beginners",
      "description": "Learn React from scratch",
      "price": 99.99,
      "image": "course_image_url"
    }
  ]
}
```

### 7. Remove Purchased Course (Protected)
**DELETE** `/user/purchasedCourse/:id`

Remove a course from purchased courses. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "msg": "course removed from purchased courses successfully",
  "updatedUser": {
    "username": "john_doe",
    "email": "john@example.com",
    "purchasedCourses": []
  }
}
```

---

## Course Routes (`/courses`)

### 1. Get All Courses (Public)
**GET** `/courses/preview`

Get all available courses without authentication.

**Response:**
```json
{
  "msg": "all courses available for user",
  "courses": [
    {
      "_id": "course_id",
      "title": "React for Beginners",
      "description": "Learn React from scratch",
      "price": 99.99,
      "image": "course_image_url"
    }
  ]
}
```

### 2. Create Course (Admin Only)
**POST** `/courses/course`

Create a new course. Requires admin authentication.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "title": "React for Beginners",
  "description": "Learn React from scratch",
  "price": 99.99,
  "image": "course_image_url"
}
```

**Response:**
```json
{
  "msg": "course created successfully"
}
```

---

## Payment Routes (`/api/razorpay`)

### 1. Create Order (Protected)
**POST** `/api/razorpay/create-order`

Create a Razorpay order for purchasing a course. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "amount": 677.79,
  "currency": "INR",
  "receipt": "receipt_688a65e78e09677cf12bd7eb_1755269955316",
  "courseId": "688a65e78e09677cf12bd7eb",
  "notes": {
    "courseTitle": "Java Development",
    "courseDescription": "Learn Java with hands-on projects."
  }
}
```

**Response:**
```json
{
  "order": {
    "id": "order_R5eSrJNWBgZNH2",
    "entity": "order",
    "amount": 67779,
    "currency": "INR",
    "receipt": "receipt_688a65e78e09677cf12bd7eb_1755269955316",
    "status": "created",
    "notes": {}
  },
  "payment": {
    "status": "pending"
  },
  "course": {
    "_id": "688a65e78e09677cf12bd7eb",
    "title": "Java Development",
    "description": "Learn Java with hands-on projects.",
    "price": 677.79
  }
}
```

---

### 2. Verify Payment (Protected)
**POST** `/api/razorpay/verify-payment`

Verify the payment after a successful transaction. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "razorpay_order_id": "order_R5eSrJNWBgZNH2",
  "razorpay_payment_id": "pay_R5eT0PZaukpEqf",
  "razorpay_signature": "1d5c1e43d20441ec6067688c91069365af8f97071cd73279b289cd9775b37a6c"
}
```

**Response (Success):**
```json
{
  "msg": "Payment verified successfully",
  "status": "ok",
  "course": {
    "_id": "688a65e78e09677cf12bd7eb",
    "title": "Java Development",
    "description": "Learn Java with hands-on projects.",
    "price": 677.79
  }
}
```

**Response (Failure):**
```json
{
  "msg": "Payment verification failed",
  "status": "failed"
}
```

---

### 3. Get Payment Status (Protected)
**GET** `/api/razorpay/payment-status/:courseId`

Get the payment status for a specific course. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "msg": "Payment status retrieved successfully",
  "status": "completed",
  "course": {
    "_id": "688a65e78e09677cf12bd7eb",
    "title": "Java Development",
    "description": "Learn Java with hands-on projects.",
    "price": 677.79
  }
}
```

---

## Admin Routes (`/admin`)

### 1. Admin Registration
**POST** `/admin/register`

Register a new admin account.

**Request Body:**
```json
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User"
}
```

**Response:**
```json
{
  "msg": "admin registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Admin Login
**POST** `/admin/login`

Authenticate admin and get JWT token.

**Request Body:**
```json
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "msg": "admin login successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Admin Courses (Protected)
**GET** `/admin/course`

Get all courses created by the admin. Requires admin authentication.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "msg": "all courses posted by admin",
  "courses": [
    {
      "_id": "course_id",
      "title": "React for Beginners",
      "description": "Learn React from scratch",
      "price": 99.99,
      "image": "course_image_url",
      "creatorId": "admin_id"
    }
  ]
}
```

### 4. Delete Course (Protected)
**DELETE** `/admin/course/:courseId`

Delete a course created by the admin. Requires admin authentication.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "msg": "Course deleted successfully"
}
```

### 5. Update Course (Protected)
**PUT** `/admin/course/:courseId`

Update a course created by the admin. Requires admin authentication.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated React Course",
  "description": "Updated description",
  "price": 149.99,
  "image": "updated_image_url"
}
```

**Response:**
```json
{
  "msg": "Course updated successfully",
  "course": {
    "_id": "course_id",
    "title": "Updated React Course",
    "description": "Updated description",
    "price": 149.99,
    "image": "updated_image_url"
  }
}
```

### 6. Get Course Purchasers (Protected)
**GET** `/admin/list/:courseId`

Get all users who purchased a specific course. Requires admin authentication.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "msg": "users who purchased the course",
  "users": [
    {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "purchasedCourses": [
        {
          "courseId": "course_id"
        }
      ]
    }
  ]
}
```

---

## Error Responses

### Common Error Format
```json
{
  "msg": "error message"
}
```

### Common Error Messages
- `"all fields are required"` - Missing required fields
- `"user not found"` - User doesn't exist
- `"course not found"` - Course doesn't exist
- `"no courses available"` - No courses found
- `"first login"` - Authentication required
- `"admin not found"` - Admin doesn't exist

---

## Environment Variables

Create a `.env` file in the backend directory:

```env
MONGO_URL=mongodb://localhost:27017/course_selling_app
JWT_SECRET_USER=your_user_jwt_secret
JWT_SECRET_ADMIN=your_admin_jwt_secret
Razorpay_KEY_ID=your_razorpay_key_id
Razorpay_KEY_SECRET=your_razorpay_key_secret
```

---

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

---

## Database Models

### User Model
- `username` (String)
- `email` (String)
- `password` (String)
- `firstName` (String)
- `lastName` (String)
- `purchasedCourses` (Array)

### Course Model
- `title` (String)
- `description` (String)
- `price` (Number)
- `image` (String)
- `creatorId` (ObjectId - Admin reference)

### Admin Model
- `username` (String)
- `email` (String)
- `password` (String)
- `firstName` (String)
- `lastName` (String)