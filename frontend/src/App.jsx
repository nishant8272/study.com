import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import LandingPage from './components/LandingPage'
import CoursesPage from './components/CoursesPage'
import Login from './components/Login'
import Signup from './components/Signup'
import UserDashboardPro from './components/UserDashboardPro'
import EnhancedAdminPanel from './components/EnhancedAdminPanel'
import CourseDetails from './components/CourseDetails'
import About from './components/About'
import Footer from './components/Footer'

function App() {
  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user-dashboard" element={<UserDashboardPro />} />
        <Route path="/admin-panel" element={<EnhancedAdminPanel />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<CoursesPage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
