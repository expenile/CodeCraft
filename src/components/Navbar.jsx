import React from 'react'
import { HiSun, HiMoon } from 'react-icons/hi'
import { useTheme } from '../hooks/useTheme'

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <div className="nav flex items-center justify-between px-4 sm:px-8 lg:px-16 xl:px-24 h-[90px] border-b border-[var(--border-color)]">
        <div className="logo">
         <h3 className='text-[25px] font-[700] sp-text'>CodeCraft AI</h3>
        </div>
        <div className="icons flex items-center gap-[15px]">
          <button 
            onClick={toggleTheme}
            className="icon transition-transform hover:scale-110"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <HiSun /> : <HiMoon />}
          </button>
        </div>
      </div>
    </>
  )
}

export default Navbar