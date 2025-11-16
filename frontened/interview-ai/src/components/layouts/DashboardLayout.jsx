import React, { useContext } from 'react'
import { UserContext } from '../../context/Usercontext'
import { Navbar } from './Navbar'

export const DashboardLayout = ({children}) => {
    
    const {user}=useContext(UserContext)
  return (
    <div>
        {/* <Navbar/> */}
         {user && <div>
             {children}
          </div>
         }
    </div>
  )
}
