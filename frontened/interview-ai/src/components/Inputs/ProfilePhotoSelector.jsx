import React, { useRef, useState } from 'react'
import { LuUser, LuUpload, LuTrash } from "react-icons/lu"

function ProfilePhotoSelector({ image, setimage }) {

  const inputRef = useRef(null);
  const [preview, setpreview] = useState(null);

  const handleimageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setimage(file);
      const previewUrl = URL.createObjectURL(file);
      setpreview(previewUrl);
    }
  }

  const handleRemoveImage = () => {
    setimage(null);
    setpreview(null);
  };

  const onChooseFile = () => {
    inputRef.current.click();
  }

  return (
    <div className='flex justify-center mb-6'>
      <input type='file' accept='image/*' ref={inputRef} onChange={handleimageChange} className='hidden' />

      {!image ? (
        <div className='w-20 h-20 flex items-center justify-center bg-orange-50 rounded-full relative cursor-pointer'>
          <LuUser className='text-4xl text-orange-500' />
          <button
            type='button'
            className='w-8 h-8 flex items-center justify-center bg-gradient-to-r from-orange-500/85 to-orange-600 text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer'
            onClick={onChooseFile}
          >
            <LuUpload />
          </button>
        </div>
      ) : (
        <div className='relative'>
          <img src={preview} alt="profile photo" className='w-20 h-20 rounded-full object-cover' />
          <button
            type="button"
            className='w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer'
            onClick={handleRemoveImage}
          >
            <LuTrash />
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfilePhotoSelector
