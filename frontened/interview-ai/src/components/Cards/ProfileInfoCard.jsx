import React from 'react'
import { useContext } from 'react'
import { UserContext } from '../../context/Usercontext';
import { useNavigate } from 'react-router-dom';

function ProfileInfoCard() {
    const {user,clearUser}=useContext(UserContext);
    const navigate=useNavigate();

    const handleLogout=()=>{
        localStorage.removeItem("token");
        clearUser();
        navigate("/");
    };


  return (
    user && (
    <div className='flex item-center '>
         <img src={user.profileImageUrl} alt='' className='w-11 h-11 bg-gray-300 rounded-full mr-3' />
           <div className=''>
             <div className='text-[15px] font-bold text-black leading-3'>
              {user.name || ""}
             </div>
             <button className='text-amber-600 text-sm font-semibold cursor-pointer hover:underline' onClick={handleLogout}>
                Logout
             </button>
           </div> 
    </div>)
  ) 
}

export default ProfileInfoCard