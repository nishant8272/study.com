import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const userToken = localStorage.getItem('userToken')
    const adminToken = localStorage.getItem('adminToken')

    if (userToken) {
      setIsLoggedIn(true)
      setUserType('user')
    } else if (adminToken) {
      setIsLoggedIn(true)
      setUserType('admin')
    }
  }, [location]) // Re-check on route change

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('adminToken')
    setIsLoggedIn(false)
    setUserType(null)
    setMobileMenuOpen(false)
    window.location.href = '/'
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/courses', label: 'Courses' },
    { to: '/about', label: 'About' }
  ]

  const isActiveLink = (path) => location.pathname === path

  return (
    <nav className="bg-gradient-to-r from-emerald-800 to-teal-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="text-white font-bold text-xl">
            <Link to="/" className="hover:text-orange-300 transition duration-300 flex items-center">
              <span className="text-2xl mr-2">🎓</span>
              <span className="hidden sm:block">Course Academy</span>
              <span className="sm:hidden">CA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg transition duration-300 ${
                  isActiveLink(link.to)
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-emerald-700'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                {userType === 'user' && (
                  <Link
                    to="/user-dashboard"
                    className={`px-3 py-2 rounded-lg transition duration-300 ${
                      isActiveLink('/user-dashboard')
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-teal-600'
                    }`}
                  >
                    📊 Dashboard
                  </Link>
                )}
                {userType === 'admin' && (
                  <Link
                    to="/admin-panel"
                    className={`px-3 py-2 rounded-lg transition duration-300 ${
                      isActiveLink('/admin-panel')
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-orange-600'
                    }`}
                  >
                    👨‍💼 Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 shadow-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition duration-300 shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg transition duration-300 ${
                    isActiveLink(link.to)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isLoggedIn ? (
                <>
                  {userType === 'user' && (
                    <Link
                      to="/user-dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-green-600 transition duration-300"
                    >
                      📊 Dashboard
                    </Link>
                  )}
                  {userType === 'admin' && (
                    <Link
                      to="/admin-panel"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-purple-600 transition duration-300"
                    >
                      👨‍💼 Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavBar
