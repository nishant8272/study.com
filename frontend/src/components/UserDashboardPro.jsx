import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PurchaseCourse from './PurchaseCourse';

function UserDashboardPro() {
  const [user, setUser] = useState(null);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token || token === 'undefined' || token === 'null') {
      window.location.href = '/login';
      return;
    }
    fetchUserData();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [allCourses, searchTerm, priceFilter, sortBy]);

  const [filteredCourses, setFilteredCourses] = useState([]);

  const filterAndSortCourses = () => {
    let filtered = [...allCourses];

    // Filter out already purchased courses
    filtered = filtered.filter(course => 
      !purchasedCourses.some(pc => pc._id === course._id)
    );

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      switch (priceFilter) {
        case 'free':
          filtered = filtered.filter(course => course.price === 0);
          break;
        case 'under50':
          filtered = filtered.filter(course => course.price > 0 && course.price < 50);
          break;
        case 'under100':
          filtered = filtered.filter(course => course.price >= 50 && course.price < 100);
          break;
        case 'over100':
          filtered = filtered.filter(course => course.price >= 100);
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'title':
        default:
          return a.title.localeCompare(b.title);
      }
    });

    setFilteredCourses(filtered);
  };

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('userToken');
      
      // Fetch all available courses
      const allCoursesResponse = await axios.get('/api/courses/preview');
      setAllCourses(allCoursesResponse.data.courses || []);
      
      // Fetch purchased courses
      try {
        const purchasedResponse = await axios.get('/api/user/purchasedCourses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setPurchasedCourses(purchasedResponse.data.purchasedCourses || []);
      } catch (purchaseError) {
        console.log('Could not fetch purchased courses:', purchaseError);
        setPurchasedCourses([]);
      }
      
      // Extract user info from token
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
      console.error('Error fetching user data:', err);
      setError(err.response?.data?.msg || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseComplete = (course) => {
    setMessage(`🎉 Successfully purchased "${course.title}"! Welcome to your new learning journey!`);
    fetchUserData(); // Refresh data
    setTimeout(() => setMessage(''), 5000);
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
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.msg || 'Failed to remove course'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your learning dashboard...</p>
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
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = allCourses.length > 0 ? (purchasedCourses.length / allCourses.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="text-4xl mr-3">🎓</span>
                Welcome back, {user?.username}!
              </h1>
              <p className="text-gray-600 mt-1">Continue your learning journey • {purchasedCourses.length} courses enrolled</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Progress: {progressPercentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Courses: {purchasedCourses.length}/{allCourses.length}</div>
              </div>
              <button 
                onClick={() => fetchUserData()}
                disabled={loading}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition duration-300 disabled:opacity-50 text-sm"
              >
                {loading ? '🔄' : '↻'} Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'my-courses', label: '📚 My Courses' },
            { id: 'discover', label: '🔍 Discover Courses' },
            { id: 'progress', label: '📈 Progress' }
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
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">📚</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">{purchasedCourses.length}</div>
                    <div className="text-sm text-gray-500">Enrolled</div>
                  </div>
                </div>
                <div className="text-gray-600">Your active courses</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">🌟</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-teal-600">{allCourses.length}</div>
                    <div className="text-sm text-gray-500">Available</div>
                  </div>
                </div>
                <div className="text-gray-600">Total courses</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">🎯</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-600">{progressPercentage.toFixed(0)}%</div>
                    <div className="text-sm text-gray-500">Progress</div>
                  </div>
                </div>
                <div className="text-gray-600">Learning completion</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">💎</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">{filteredCourses.length}</div>
                    <div className="text-sm text-gray-500">To Explore</div>
                  </div>
                </div>
                <div className="text-gray-600">New opportunities</div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Learning Journey</h2>
                  <p className="text-emerald-100">Keep up the excellent progress!</p>
                </div>
                <div className="text-6xl">🚀</div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Learning Progress</span>
                  <span>{purchasedCourses.length} / {allCourses.length} courses</span>
                </div>
                <div className="w-full bg-emerald-400 rounded-full h-4">
                  <div 
                    className="bg-orange-400 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-emerald-100">{progressPercentage.toFixed(1)}% of all courses completed</p>
            </div>

            {/* Recent Courses */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">⚡</span>
                Recently Enrolled
              </h3>
              {purchasedCourses.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {purchasedCourses.slice(0, 3).map((course) => (
                    <div key={course._id} className="border rounded-xl p-4 hover:shadow-md transition duration-200">
                      <img src={course.image} alt={course.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{course.description.substring(0, 80)}...</p>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-600 font-semibold">${course.price}</span>
                        <Link to={`/course/${course._id}`} className="text-emerald-600 hover:underline text-sm">
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-500 text-lg mb-4">No courses enrolled yet</p>
                  <button 
                    onClick={() => setActiveTab('discover')}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
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
                My Learning Library ({purchasedCourses.length} courses)
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
                    onClick={() => setActiveTab('discover')}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition duration-300 shadow-md"
                  >
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchasedCourses.map((course) => (
                    <div key={course._id} className="border rounded-2xl overflow-hidden hover:shadow-lg transition duration-300">
                      <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2 text-gray-900">{course.title}</h3>
                        <p className="text-gray-600 mb-4 text-sm">{course.description.substring(0, 100)}...</p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-emerald-600 font-bold text-lg">${course.price}</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                            ✅ Enrolled
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/course/${course._id}`}
                            className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition duration-200 text-center text-sm"
                          >
                            View Course
                          </Link>
                          <button
                            onClick={() => handleRemoveCourse(course._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Discover Courses Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-3xl mr-3">🔍</span>
                Discover New Courses
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Courses</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="all">All Prices</option>
                    <option value="free">Free</option>
                    <option value="under50">Under $50</option>
                    <option value="under100">$50 - $100</option>
                    <option value="over100">Over $100</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="title">Title (A-Z)</option>
                    <option value="price-low">Price (Low to High)</option>
                    <option value="price-high">Price (High to Low)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Course Results */}
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">
                    {filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''} Available
                  </h3>
                  {(searchTerm || priceFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setPriceFilter('all');
                        setSortBy('title');
                      }}
                      className="text-emerald-600 hover:text-emerald-800 font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6">
                {filteredCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or browse all available courses
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setPriceFilter('all');
                        setSortBy('title');
                      }}
                      className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
                    >
                      Show All Courses
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <div key={course._id} className="border rounded-2xl overflow-hidden hover:shadow-lg transition duration-300">
                        <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                        <div className="p-6">
                          <h3 className="font-bold text-lg mb-2 text-gray-900">{course.title}</h3>
                          <p className="text-gray-600 mb-4 text-sm">{course.description.substring(0, 100)}...</p>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-emerald-600 font-bold text-lg">${course.price}</span>
                            <Link to={`/course/${course._id}`} className="text-emerald-600 hover:underline text-sm">
                              View Details →
                            </Link>
                          </div>
                          <PurchaseCourse 
                            course={course} 
                            onPurchaseComplete={handlePurchaseComplete}
                            className="w-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-3">📈</span>
              Learning Progress & Analytics
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Progress Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Courses Enrolled</span>
                    <span className="font-semibold">{purchasedCourses.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Available</span>
                    <span className="font-semibold">{allCourses.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <span className="font-semibold text-emerald-600">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Course Categories */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Learning Categories</h3>
                <div className="space-y-3">
                  {purchasedCourses.length > 0 ? (
                    purchasedCourses.map((course) => (
                      <div key={course._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{course.title}</span>
                        <span className="text-emerald-600 text-sm">✅ Enrolled</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No courses enrolled yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboardPro;
