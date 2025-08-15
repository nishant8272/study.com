import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      
      // Fetch purchased courses
      const purchasedResponse = await axios.get('/api/user/purchasedCourses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Fetch all available courses
      const allCoursesResponse = await axios.get('/api/user/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setPurchasedCourses(purchasedResponse.data.purchasedCourses || []);
      setAllCourses(allCoursesResponse.data.courses || []);
      
      // Extract user info from token (with error handling)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          username: payload.username || 'User',
          email: payload.email || ''
        });
      } catch (tokenError) {
        setUser({
          username: 'User',
          email: ''
        });
      }
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCourse = async (courseId) => {
    setMessage('');
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post(`/api/user/purchase/${courseId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMessage(response.data.msg || 'Course purchased successfully!');
      fetchUserData(); // Refresh data
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Purchase failed');
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to remove this course?')) return;
    
    setMessage('');
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.delete(`/api/user/purchasedCourse/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMessage(response.data.msg || 'Course removed successfully!');
      fetchUserData(); // Refresh data
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Failed to remove course');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  const availableCourses = allCourses.filter(
    course => !purchasedCourses.some(pc => pc._id === course._id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.username}!
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('my-courses')}
            className={`px-4 py-2 rounded ${
              activeTab === 'my-courses'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded ${
              activeTab === 'browse'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Browse Courses
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded ${
            message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{purchasedCourses.length}</div>
                <div className="text-sm text-gray-500">Courses Enrolled</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{allCourses.length}</div>
                <div className="text-sm text-gray-500">Total Available</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600">{availableCourses.length}</div>
                <div className="text-sm text-gray-500">Not Enrolled</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              {purchasedCourses.length > 0 ? (
                <div className="space-y-3">
                  {purchasedCourses.slice(0, 3).map((course) => (
                    <div key={course._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                      <img src={course.image} alt={course.title} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-sm text-gray-600">Enrolled</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No courses enrolled yet. Browse courses to get started!</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'my-courses' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">My Enrolled Courses</h2>
            </div>
            <div className="p-6">
              {purchasedCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No courses enrolled yet. 
                  <button 
                    onClick={() => setActiveTab('browse')}
                    className="text-blue-600 hover:underline ml-1"
                  >
                    Browse courses
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {purchasedCourses.map((course) => (
                    <div key={course._id} className="border rounded-lg p-4">
                      <img src={course.image} alt={course.title} className="w-full h-48 object-cover rounded mb-4" />
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4">{course.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-600 font-semibold">${course.price}</span>
                        <button
                          onClick={() => handleRemoveCourse(course._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'browse' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Available Courses</h2>
            </div>
            <div className="p-6">
              {availableCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  You've enrolled in all available courses!
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableCourses.map((course) => (
                    <div key={course._id} className="border rounded-lg p-4">
                      <img src={course.image} alt={course.title} className="w-full h-48 object-cover rounded mb-4" />
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4">{course.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-600 font-semibold">${course.price}</span>
                        <button
                          onClick={() => handlePurchaseCourse(course._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
