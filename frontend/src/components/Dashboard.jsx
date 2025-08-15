import React from "react";

const user = {
  name: "Nishant Verma",
  coursesEnrolled: 3,
  totalCourses: 8,
  completedCourses: 1,
};

const myCourses = [
  { title: "React for Beginners", progress: 80 },
  { title: "Node.js Essentials", progress: 40 },
  { title: "UI/UX Design Basics", progress: 100 },
];

function Dashboard() {
  return (
    <div className="min-h-[80vh] bg-gray-50 py-8 px-4 md:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-blue-700">Welcome, {user.name}!</h1>
        <p className="mb-6 text-gray-600">Here’s your learning dashboard.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{user.coursesEnrolled}</div>
            <div className="text-sm text-gray-500">Courses Enrolled</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{user.completedCourses}</div>
            <div className="text-sm text-gray-500">Courses Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{user.totalCourses}</div>
            <div className="text-sm text-gray-500">Total Courses</div>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-blue-700">My Courses</h2>
        <div className="space-y-4">
          {myCourses.map((course, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="font-medium text-gray-800">{course.title}</div>
              <div className="w-full md:w-1/3 mt-2 md:mt-0">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">{course.progress}% complete</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 