import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CourseDetailCard from './CourseDetailCard';
import { createLogger } from 'vite';

function EnhancedUserDashboard() {
  const [user, setUser] = useState(null);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [purchaseLoading, setPurchaseLoading] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    console.log(token)
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
      console.log(token)
      // Fetch purchased courses
      const purchasedResponse = await axios.get('/api/user/purchasedCourses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Purchased response:', purchasedResponse.data);
      
      // Fetch all available courses
      const allCoursesResponse = await axios.get('/api/user/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('All courses response:', allCoursesResponse.data);
     
      // Safely set purchased courses with fallback
      if (purchasedResponse.data && purchasedResponse.data.purchasedCourses) {
        setPurchasedCourses(purchasedResponse.data.purchasedCourses);
      } else {
        console.warn('No purchasedCourses in response, setting empty array');
        setPurchasedCourses([]);
      }
      
      // Safely set all courses with fallback
      if (allCoursesResponse.data && allCoursesResponse.data.courses) {
        setAllCourses(allCoursesResponse.data.courses);
      } else {
        console.warn('No courses in response, setting empty array');
        setAllCourses([]);
      }
      
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
      console.error('Error in fetchUserData:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(err.response?.data?.msg || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCourse = async (courseId) => {
    setPurchaseLoading(courseId);
    setMessage('');
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post(`/api/user/purchase/${courseId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMessage('🎉 Course purchased successfully! Welcome to your new learning journey!');
      fetchUserData(); // Refresh data
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.msg || 'Purchase failed'));
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to remove this course from your library?')) return;
    
    setMessage('');
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.delete(`/api/user/purchasedCourse/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMessage('✅ Course removed from your library');
      fetchUserData(); // Refresh data
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.msg || 'Failed to remove course'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const availableCourses = allCourses.filter(
    course => !purchasedCourses.some(pc => pc._id === course._id)
  );

  const progressPercentage = allCourses.length > 0 ? (purchasedCourses.length / allCourses.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-gray-600 mt-1">Ready to continue your learning journey?</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-300 shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'my-courses', label: '📚 My Courses', icon: '📚' },
            { id: 'browse', label: '🔍 Discover', icon: '🔍' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition duration-300 ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl shadow-md ${
            message.includes('🎉') || message.includes('✅') 
              ? 'bg-green-100 text-green-800 border-l-4 border-green-500' 
              : 'bg-red-100 text-red-800 border-l-4 border-red-500'
          }`}>
            <div className="flex items-center">
              <span className="text-lg mr-2">
                {message.includes('🎉') || message.includes('✅') ? '🎉' : '⚠️'}
              </span>
              {message}
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Progress Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Learning Progress</h2>
                  <p className="text-emerald-100">Keep up the great work!</p>
                </div>
                <div className="text-6xl">🎯</div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Courses Completed</span>
                  <span>{purchasedCourses.length} / {allCourses.length}</span>
                </div>
                <div className="w-full bg-emerald-400 rounded-full h-3">
                  <div
                    className="bg-orange-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-emerald-100">{progressPercentage.toFixed(1)}% of available courses enrolled</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">📚</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">{purchasedCourses.length}</div>
                    <div className="text-sm text-gray-500">Enrolled Courses</div>
                  </div>
                </div>
                <div className="text-gray-600">Your active learning library</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">🌟</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-teal-600">{allCourses.length}</div>
                    <div className="text-sm text-gray-500">Total Available</div>
                  </div>
                </div>
                <div className="text-gray-600">Courses waiting for you</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">🔍</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-600">{availableCourses.length}</div>
                    <div className="text-sm text-gray-500">Not Enrolled</div>
                  </div>
                </div>
                <div className="text-gray-600">New opportunities to explore</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">⚡</span>
                Recent Activity
              </h3>
              {purchasedCourses.length > 0 ? (
                <div className="space-y-4">
                  {purchasedCourses.map((course) => (
                    <div key={course._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-200">
                      <img src={course.image} alt={course.title} className="w-16 h-16 object-cover rounded-lg shadow-md" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-600">Enrolled • Ready to continue</p>
                      </div>
                      <div className="text-blue-600 font-semibold">${course.price}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-gray-500 text-lg">No courses enrolled yet. Start your learning journey!</p>
                  <button 
                    onClick={() => setActiveTab('browse')}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Discover Courses
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Courses Tab */}
        {activeTab === 'my-courses' && (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-3xl mr-3">📚</span>
                My Learning Library
              </h2>
            </div>
            <div className="p-6">
              {purchasedCourses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Your library is empty</h3>
                  <p className="text-gray-600 mb-6">
                    Start building your knowledge with our amazing courses!
                  </p>
                  <button 
                    onClick={() => setActiveTab('browse')}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
                  >
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchasedCourses.map((course) => (
                    <CourseDetailCard
                      key={course._id}
                      course={course}
                      isPurchased={true}
                      onRemove={handleRemoveCourse}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Browse Courses Tab */}
        {activeTab === 'browse' && (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-3xl mr-3">🔍</span>
                Discover New Courses
              </h2>
            </div>
            <div className="p-6">
              {availableCourses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Amazing! You've enrolled in all courses!</h3>
                  <p className="text-gray-600">
                    You're a learning champion! Check back later for new courses.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableCourses.map((course) => (
                    <CourseDetailCard
                      key={course._id}
                      course={course}
                      isPurchased={false}
                      onPurchase={handlePurchaseCourse}
                      showActions={true}
                    />
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

export default EnhancedUserDashboard;
