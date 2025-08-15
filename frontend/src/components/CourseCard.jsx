import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function CourseCard({ id, title, description, img, price }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className="max-w-sm rounded-xl overflow-hidden shadow-lg bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="relative">
        {imageLoading && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
        {imageError ? (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">📚</div>
              <div>Course Image</div>
            </div>
          </div>
        ) : (
          <img
            className={`w-full h-48 object-cover ${imageLoading ? 'hidden' : 'block'}`}
            src={img}
            alt={title}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        <div className="absolute top-4 right-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            {price}
          </span>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2 text-gray-900 line-clamp-2">{title}</div>
        <p className="text-gray-600 text-sm leading-relaxed">{description.substring(0, 100)}...</p>
      </div>
      <div className="px-6 pb-6">
        <Link
          to={`/course/${id}`}
          className="w-full block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 text-center font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}
export default CourseCard
