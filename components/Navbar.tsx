import React from 'react'
import { ModeToggle } from './ModeToggle'

const Navbar = () => {
  return (
    <div className='w-screen h-10 px-10 py-8 flex justify-between bg-background '>
      <h1 className='font-bold text-xl'>
        TunePalace
      </h1>
      <ModeToggle />
    </div>
  )
}

export default Navbar