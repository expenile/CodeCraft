import React from 'react'
import { Link } from 'react-router-dom'
import { HiHome } from 'react-icons/hi'

const NoPage = () => {
  return (
    <div className="min-h-screen bg-[var(--primary-bg)] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Page Not Found</h2>
          <p className="text-[var(--text-secondary)]">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-80 hover:scale-105 transition-all duration-200 shadow-lg"
        >
          <HiHome />
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NoPage