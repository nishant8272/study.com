import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function CourseDetailCard({ course, isPurchased = false, onRemove, onPurchase, showActions = true }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove this course from your library?')) return;
    setRemoving(true);
    try {
      await onRemove(course._id);
    } finally {
      setRemoving(false);
    }
  };

  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Course Image */}
      <div className="relative">
        {imageLoading && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
        {imageError ? (
          <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-sm">Course Image</div>
            </div>
          </div>
        ) : (
          <img 
            className={`w-full h-48 object-cover ${imageLoading ? 'hidden' : 'block'}`} 
            src={course.image} 
            alt={course.title}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${
            isPurchased 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-600 text-white'
          }`}>
            {isPurchased ? '✅ Owned' : `$${course.price}`}
          </span>
        </div>

        {/* Status Overlay */}
        {isPurchased && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
              <span className="mr-2">🎓</span>
              Enrolled
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {truncateText(course.description)}
          </p>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{course.price}</div>
            <div className="text-xs text-gray-500">Price</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {isPurchased ? '✓' : '○'}
            </div>
            <div className="text-xs text-gray-500">Status</div>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-2">
            <Link 
              to={`/course/${course._id}`}
              className="w-full block bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 text-center font-medium"
            >
              View Details →
            </Link>
            
            {isPurchased ? (
              <button
                onClick={handleRemove}
                disabled={removing}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {removing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Removing...
                  </div>
                ) : (
                  <>
                    <span className="mr-1">🗑️</span>
                    Remove from Library
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => onPurchase && onPurchase(course._id)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 text-sm font-medium"
              >
                <span className="mr-1">💳</span>
                Enroll Now - ${course.price}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetailCard;
