import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import * as MessagesData from './Data'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative group/menu px-15'>
      <div onClick={() => setIsOpen(!isOpen)} className='relative after:absolute after:w-10 after:h-10 after:rounded-full hover:text-primary after:-top-1/2 hover:after:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer'>
        <Icon icon='tabler:bell-ringing' height={20} />
        <span className='rounded-full absolute -end-[6px] -top-[5px] text-[10px] h-2 w-2 bg-primary flex justify-center items-center'></span>
      </div>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-72 bg-white dark:bg-dark shadow-lg rounded-xl border border-gray-100 py-4 z-50'>
          <div className='flex items-center px-6 justify-between mb-2'>
            <h3 className='mb-0 text-lg font-semibold text-gray-800'>Notifikasi</h3>
          </div>

          <SimpleBar className='max-h-80 mt-3'>
            {MessagesData.Notifications.map((item, index) => (
              <Link key={index} to='#' onClick={() => setIsOpen(false)} className='px-6 py-3 flex justify-between items-center group/link w-full hover:bg-lightprimary hover:text-primary border-b border-gray-50 last:border-0'>
                <div className='flex items-center'>
                  <div className='ps-0'>
                    <h5 className='mb-1 text-sm font-medium text-gray-800 group-hover/link:text-primary'>{item.title}</h5>
                    <span className='text-xs block truncate text-gray-500'>{item.subtitle}</span>
                  </div>
                </div>
              </Link>
            ))}
          </SimpleBar>
        </div>
      )}
    </div>
  )
}

export default Notifications