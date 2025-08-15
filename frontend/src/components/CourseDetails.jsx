import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import PurchaseCourse from './PurchaseCourse';

function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem('userToken');
      console.log('Token exists:', !!token);

      if (!token || token === 'undefined' || token === 'null') {
        // Fetch course from public endpoint if not logged in
        console.log('Fetching course from public endpoint');
        const response = await axios.get(`/api/courses/preview`);
        const foundCourse = response.data.courses.find(c => c._id === id);
        if (foundCourse) {
          setCourse(foundCourse);
        } else {
          setError('Course not found');
        }
        setIsPurchased(false);
      } else {
        // Validate token format
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            throw new Error('Invalid token format');
          }
        } catch (tokenError) {
          console.error('Invalid token, clearing and fetching public course');
          localStorage.removeItem('userToken');
          const response = await axios.get(`/api/courses/preview`);
          const foundCourse = response.data.courses.find(c => c._id === id);
          if (foundCourse) {
            setCourse(foundCourse);
          } else {
            setError('Course not found');
          }
          setIsPurchased(false);
          setLoading(false);
          return;
        }

        // Fetch course details for logged in user
        try {
          const response = await axios.get(`/api/user/course/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          setCourse(response.data.course);
        } catch (courseError) {
          // If user course endpoint fails, fallback to public endpoint
          console.log('User course endpoint failed, using public endpoint');
          const response = await axios.get(`/api/courses/preview`);
          const foundCourse = response.data.courses.find(c => c._id === id);
          if (foundCourse) {
            setCourse(foundCourse);
          } else {
            setError('Course not found');
          }
        }

        // Check if user already purchased this course
        try {
          const purchasedResponse = await axios.get('/api/user/purchasedCourses', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const purchasedCourses = purchasedResponse.data.purchasedCourses || [];
          setIsPurchased(purchasedCourses.some(pc => pc._id === id));
        } catch (purchaseCheckError) {
          console.log('Could not check purchase status:', purchaseCheckError);
          setIsPurchased(false);
        }
      }
    } catch (err) {
      console.error('CourseDetails error:', err);
      setError(err.response?.data?.msg || 'Failed to fetch course details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseComplete = (course) => {
    setIsPurchased(true);
    // Optionally refresh course details
    fetchCourseDetails();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading course details...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl text-red-600">Error: {error}</div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Course not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">{course.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-blue-600">{course.price}</span>
              </div>

              {localStorage.getItem('userToken') ? (
                isPurchased ? (
                  <div className="w-full bg-green-100 border border-green-300 text-green-800 py-3 px-6 rounded-lg text-center font-semibold">
                    <span className="mr-2">✅</span>
                    Course Purchased - You have access!
                    <div className="mt-2">
                      <Link
                        to="/user-dashboard"
                        className="text-green-600 hover:text-green-800 underline"
                      >
                        Go to Dashboard →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <PurchaseCourse
                    course={course}
                    onPurchaseComplete={handlePurchaseComplete}
                  />
                )
              ) : (
                <div className="text-center">
                  <Link
                    to="/login"
                    className="w-full block bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
                  >
                    Login to Purchase Course
                  </Link>
                  <p className="mt-2 text-sm text-gray-600">
                    New to our platform?
                    <Link to="/signup" className="text-blue-600 hover:underline ml-1">
                      Sign up for free
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">What you'll learn:</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Comprehensive understanding of the subject</li>
                <li>• Practical hands-on experience</li>
                <li>• Industry best practices</li>
                <li>• Real-world projects</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Course Features:</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Lifetime access</li>
                <li>• Mobile and desktop access</li>
                <li>• Certificate of completion</li>
                <li>• 30-day money-back guarantee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
