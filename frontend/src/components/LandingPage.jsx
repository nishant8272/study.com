import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from './CourseCard';
import axios from 'axios';

function LandingPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [length, setLength] = useState(0);

  const learning = [{
    path: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Learn at Your Pace",
    value: "Access courses anytime, anywhere. Our flexible learning platform adapts to your schedule and learning style."
  },
  {
    path: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    title: "Expert Tutors",
    value: " Learn from industry experts and certified professionals who bring real-world experience to every course."
  }, {
    path: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253",
    title: "Lifetime Access",
    value: " Learn from industry experts and certified professionals who bring real-world experience to every course."
  }]

  const userExperience = [{
    title: "sk",
    name: "sidhart kumar",
    role: "software development",
    experience: "The Python course completely changed my career trajectory. I went from a complete beginner to landing my dream job in just 6 months!"
  }, {
    title: "rj",
    name: "rakesh joshi",
    role: "python developmet",
    experience: "Amazing platform! The instructors are top-notch and the content is always up-to-date with industry standards. Highly recommended!"
  }, {
    title: "nv",
    name: "nishant verma",
    role: "MERN STACK COURSE",
    experience: "amazing course for mern stack development. i will hignly recommeded it."
  }
  ]
  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await axios.get('/api/courses/preview');
      const courseLength = response.data.courses.length;
      setLength(courseLength)
      setCourses(response.data.courses.slice(0, 3) || []);
    } catch (err) {
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden h-screen bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Your
              <span className="block text-orange-300">Career Today</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of learners who are advancing their skills with our expert-designed courses.
              Learn at your own pace, get certified, and unlock new opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="bg-orange-400 text-emerald-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-300 transform hover:scale-105 transition duration-300 shadow-lg"
              >
                Explore Courses
              </Link>
              <Link
                to="/signup"
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-emerald-600 transition duration-300"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>

        {/* Floating elements for visual appeal */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-teal-300 rounded-full opacity-30 animate-ping"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-emerald-600 mb-2">1000+</div>
              <div className="text-gray-600">Happy Students</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-teal-600 mb-2">{length}</div>
              <div className="text-gray-600">Expert Courses</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {learning.map(learn => (
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={learn.path} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{learn.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {learn.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Courses</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start your learning journey with our most popular courses
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">Unable to load courses at the moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {courses.map(course => (
                <CourseCard
                  key={course._id}
                  id={course._id}
                  title={course.title}
                  description={course.description}
                  img={course.image}
                  price={course.price}
                />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/courses"
              className="bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-700 transform hover:scale-105 transition duration-300 shadow-lg inline-flex items-center"
            >
              View All Courses
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              Join thousands of successful learners who transformed their careers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {userExperience.map(user => (
              <div className="bg-white bg-opacity-10 p-8 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center mr-4">
                    <span className="text-emerald-900 font-bold text-lg">{user.title}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700">{user.name}</h4>
                    <p className="text-blue-800 text-sm">{user.role}</p>
                  </div>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  {user.experience}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-emerald-900 mb-4">Ready to Start Learning?</h2>
          <p className="text-xl text-emerald-800 mb-8 max-w-2xl mx-auto">
            Join our community of learners and start building the skills you need for success
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-700 transform hover:scale-105 transition duration-300 shadow-lg"
            >
              Start Learning Today
            </Link>
            <Link
              to="/courses"
              className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 hover:text-white transition duration-300"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
