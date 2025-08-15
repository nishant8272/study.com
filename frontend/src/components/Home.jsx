import React, { useEffect, useState } from 'react'
import CourseCard from './CourseCard'
import axios from 'axios'
function Home() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
 
 
  async function fetchCourses() {
    try {
      const response = await axios.get('/api/courses/preview',
          {
            headers: {
              'Content-Type': 'application/json',

            },
          }
      )

      console.log(response.data)
      setCourses(response.data.courses || [])
    } catch (err) {
      setError(err.message)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchCourses()
  }, [])

  if (loading) return <p>Loading courses...</p>
  if (error) return <p>Error loading courses: {error}</p>

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
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
  )
}

export default Home
