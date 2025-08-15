import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EnhancedAdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [coursesStats, setCoursesStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    price: '',
    image: ''
  });
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Validate token format
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid token format');
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
        return;
      }
    } catch (tokenError) {
      console.error('Token validation error:', tokenError);
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
      return;
    }

    if (activeTab === 'overview' || activeTab === 'courses') {
      fetchAdminCourses();
    }
  }, [activeTab]);

  const fetchAdminCourses = async (retryCount = 0) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin first');
        setLoading(false);
        return;
      }

      console.log('Attempting to fetch admin courses, retry count:', retryCount);
      console.log('Token being sent:', token?.substring(0, 50) + '...');

      // Validate token format before sending
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token format');
      }

      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      console.log('Token validation passed, sending request...');
      const response = await axios.get('/api/admin/course', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Admin courses response:', response.data);
      const coursesData = response.data.courses || [];
      setCourses(coursesData);
      
      // Calculate course statistics
      const stats = {
        totalCourses: coursesData.length,
        totalValue: coursesData.reduce((sum, course) => sum + parseFloat(course.price || 0), 0),
        averagePrice: coursesData.length > 0 ? (coursesData.reduce((sum, course) => sum + parseFloat(course.price || 0), 0) / coursesData.length).toFixed(2) : 0,
        mostExpensive: coursesData.length > 0 ? Math.max(...coursesData.map(c => parseFloat(c.price || 0))) : 0
      };
      setCoursesStats(stats);
      
    } catch (err) {
      console.error('Error fetching admin courses:', err);

      // Retry logic for server errors
      if (err.response?.status === 500 && retryCount < 2) {
        console.log(`Retrying request (attempt ${retryCount + 1})`);
        setTimeout(() => fetchAdminCourses(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      if (err.response?.status === 401) {
        setError('🔐 Admin session expired. Please login again.');
        localStorage.removeItem('adminToken');
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (err.response?.status === 500) {
        setError('🔧 Server error occurred. Please refresh the page or try again later.');
      } else if (err.response?.status === 404) {
        setError('👤 Admin account not found. Please check your credentials.');
      } else if (err.code === 'ECONNABORTED') {
        setError('⏱️ Request timeout. Please check your connection and try again.');
      } else {
        setError(`❌ ${err.response?.data?.msg || 'Failed to fetch courses. Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseUsers = async (courseId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`/api/admin/list/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUsers(response.data.users || []);
      setActiveTab('users');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login as admin first');
        return;
      }
      
      const url = editingCourse 
        ? `/api/admin/course/${editingCourse._id}`
        : '/api/courses/course';
      
      const method = editingCourse ? 'put' : 'post';
      
      const response = await axios[method](url, courseForm, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMessage(`✅ Course ${editingCourse ? 'updated' : 'created'} successfully!`);
      setCourseForm({ title: '', description: '', price: '', image: '' });
      setEditingCourse(null);
      fetchAdminCourses();
    } catch (err) {
      setError(`❌ Failed to ${editingCourse ? 'update' : 'create'} course: ${err.response?.data?.msg || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setMessage('✅ Course deleted successfully!');
      fetchAdminCourses();
    } catch (err) {
      setError(`❌ Failed to delete course: ${err.response?.data?.msg || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setCourseForm({
      title: course.title,
      description: course.description,
      price: course.price,
      image: course.image
    });
    setEditingCourse(course);
    setActiveTab('add-course');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="text-4xl mr-3">👨‍💼</span>
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage your courses and students</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Courses: {coursesStats.totalCourses || 0}</div>
                <div className="text-sm text-gray-500">Total Value: ${coursesStats.totalValue || 0}</div>
              </div>
              <button
                onClick={() => fetchAdminCourses(0)}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 text-sm"
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
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'courses', label: '📚 Manage Courses', icon: '📚' },
            { id: 'add-course', label: editingCourse ? '✏️ Edit Course' : '➕ Add Course', icon: editingCourse ? '✏️' : '➕' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition duration-300 ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {activeTab === 'users' && (
            <button
              onClick={() => setActiveTab('courses')}
              className="px-6 py-3 rounded-xl bg-gray-600 text-white hover:bg-gray-700 transition duration-300"
            >
              ← Back to Courses
            </button>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl shadow-md ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-800 border-l-4 border-green-500' 
              : 'bg-red-100 text-red-800 border-l-4 border-red-500'
          }`}>
            <div className="flex items-center">
              <span className="text-lg mr-2">
                {message.includes('✅') ? '🎉' : '⚠️'}
              </span>
              {message}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-100 text-red-800 border-l-4 border-red-500">
            <div className="flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">📚</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">{coursesStats.totalCourses || 0}</div>
                    <div className="text-sm text-gray-500">Total Courses</div>
                  </div>
                </div>
                <div className="text-gray-600">Courses you've created</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">💰</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-teal-600">{coursesStats.totalValue || 0}</div>
                    <div className="text-sm text-gray-500">Total Value</div>
                  </div>
                </div>
                <div className="text-gray-600">Combined course value</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">📈</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-600">{coursesStats.averagePrice || 0}</div>
                    <div className="text-sm text-gray-500">Average Price</div>
                  </div>
                </div>
                <div className="text-gray-600">Per course average</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">🎯</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">{coursesStats.mostExpensive || 0}</div>
                    <div className="text-sm text-gray-500">Highest Price</div>
                  </div>
                </div>
                <div className="text-gray-600">Most expensive course</div>
              </div>
            </div>

            {/* Recent Courses */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">⚡</span>
                Your Recent Courses
              </h3>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-200">
                      <img src={course.image} alt={course.title} className="w-16 h-16 object-cover rounded-lg shadow-md" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-600">{course.description.substring(0, 60)}...</p>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-600 font-semibold">{course.price}</div>
                        <button
                          onClick={() => fetchCourseUsers(course._id)}
                          className="text-sm text-green-600 hover:underline"
                        >
                          View Students
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-gray-500 text-lg">No courses created yet. Create your first course!</p>
                  <button
                    onClick={() => setActiveTab('add-course')}
                    className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
                  >
                    Create Course
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-3xl mr-3">📚</span>
                Manage Your Courses
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <div>Loading courses...</div>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses found</h3>
                  <p className="text-gray-600 mb-6">
                    Start creating amazing courses for your students!
                  </p>
                  <button
                    onClick={() => setActiveTab('add-course')}
                    className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition duration-300 shadow-md"
                  >
                    Create Your First Course
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <div key={course._id} className="border rounded-2xl p-6 hover:shadow-lg transition duration-300">
                      <div className="flex items-start space-x-4">
                        <img src={course.image} alt={course.title} className="w-20 h-20 object-cover rounded-lg shadow-md" />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{course.description.substring(0, 100)}...</p>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-blue-600 font-bold text-lg">{course.price}</span>
                            <button
                              onClick={() => fetchCourseUsers(course._id)}
                              className="text-sm text-green-600 hover:underline font-medium"
                            >
                              👥 View Students
                            </button>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditCourse(course)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Course Tab */}
        {activeTab === 'add-course' && (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-3xl mr-3">{editingCourse ? '✏️' : '➕'}</span>
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter course title..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32"
                  placeholder="Describe your course in detail..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Image URL</label>
                <input
                  type="url"
                  value={courseForm.image}
                  onChange={(e) => setCourseForm({...courseForm, image: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                  required
                />
                {courseForm.image && (
                  <div className="mt-3">
                    <img src={courseForm.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg shadow-md" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {editingCourse ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingCourse ? '✏️ Update Course' : '➕ Create Course'
                  )}
                </button>
                {editingCourse && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCourse(null);
                      setCourseForm({ title: '', description: '', price: '', image: '' });
                      setActiveTab('courses');
                    }}
                    className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-3xl mr-3">👥</span>
                Students Enrolled in This Course
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">Loading students...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No students enrolled yet</h3>
                  <p className="text-gray-600">
                    Students will appear here once they purchase this course
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <div key={user._id} className="border rounded-xl p-4 hover:shadow-md transition duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.firstName ? user.firstName.charAt(0) : user.username.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                          </h4>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
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

export default EnhancedAdminPanel;
