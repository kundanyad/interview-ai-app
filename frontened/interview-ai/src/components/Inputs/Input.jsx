// Input.jsx
import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

function Input({ type, value, onChange, lable, placeholder }) {
  const [showpassword, setshowpassword] = useState(false);

  const togglepassword = () => {
    setshowpassword(!showpassword);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] text-slate-800">{lable}</label>
      <div className="flex items-center border rounded px-2 focus-within:border-blue-500">
        <input
          type={type === "password" ? (showpassword ? "text" : "password") : type}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none py-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {type === "password" && (
          <>
            {showpassword ? (
              <FaRegEye
                size={20}
                className="text-primary cursor-pointer"
                onClick={togglepassword}
              />
            ) : (
              <FaRegEyeSlash
                size={20}
                className="text-slate-400 cursor-pointer"
                onClick={togglepassword}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Input;
