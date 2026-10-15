import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Profile from './Profile'
import SidebarLayout from '../sidebar/Sidebar'

const Header = () => {
  const [isSticky, setIsSticky] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  })

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setIsSticky(true)
      else setIsSticky(false)
    }
    window.addEventListener('scroll', handleScroll)
    
    // Sinkronisasi DOM dengan state awal tanpa memanggil setState
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDark])

  const toggleMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  }

  return (
    <>
      <header className={`sticky top-0 z-20 ${isSticky ? 'bg-background shadow-md fixed w-full' : 'bg-transparent'}`}>
        <nav className={`rounded-none py-4 sm:ps-6 max-w-full sm:pe-10 dark:bg-dark flex justify-between items-center px-6`}>
          
          {/* Mobile Toggle Icon */}
          <div onClick={() => setIsOpen(true)} className='px-3.5 hover:text-primary text-gray-500 relative rounded-full xl:hidden flex justify-center items-center cursor-pointer'>
            <Icon icon='tabler:menu-2' height={20} width={20} />
          </div>

          <div className='block xl:hidden'>
            <img src={isDark ? "/images/logos/logopetropacific.png" : "/images/logos/logopetropacific.png"} alt="Logo" className={`transition-all duration-300 h-8`} />
          </div>

          {/* Mobile Right Icons */}
          <div className='flex xl:hidden items-center gap-2'>
            <div className='hover:text-primary p-2 group rounded-full flex justify-center items-center cursor-pointer text-gray-500 relative' onClick={toggleMode}>
              {isDark ? <Icon icon='solar:sun-bold-duotone' width='22' className='text-primary' /> : <Icon icon='tabler:moon' width='22' />}
            </div>
            <Profile />
          </div>

          {/* Desktop Navbar */}
          <div className='hidden xl:flex items-center justify-between w-full'>
            <div className='flex w-full justify-end items-end'>
              <div className='flex gap-4 items-center'>
                
                <div className='hover:text-primary px-2 group rounded-full flex justify-center items-center cursor-pointer text-gray-500 relative' onClick={toggleMode}>
                  <span className='flex items-center justify-center p-2 rounded-full hover:bg-lightprimary'>
                    {isDark ? <Icon icon='solar:sun-bold-duotone' width='22' className='text-primary' /> : <Icon icon='tabler:moon' width='22' />}
                  </span>
                </div>

                <Profile />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar Overlay (Pengganti Shadcn Sheet) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex xl:hidden">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-[270px] bg-white h-full shadow-xl animate-in slide-in-from-left">
            <SidebarLayout onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}

export default Header