import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import { validateEmail } from "../../utils/healper";
import { UserContext } from "../../context/Usercontext";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import uploadimage from "../../utils/uploadimage";

const SignUp = ({ setCurrPage }) => {
  const [profilepic, setProfilepic] = useState(null);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);

  const handleSignup = async (e) => {
  e.preventDefault();

  if (!fullname) return setError("Please enter full name.");
  if (!validateEmail(email)) return setError("Please enter a valid email.");
  if (!password) return setError("Please enter the password");

  setError("");

  try {
    const formData = new FormData();
    formData.append("name", fullname);
    formData.append("email", email);
    formData.append("password", password);

    if (profilepic) {
      formData.append("image", profilepic); // ✅ must match multer.single('image')
    }

    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const { token } = response.data;
    if (token) {
      localStorage.setItem("token", token);
      updateUser(response.data);
    
      navigate("/dashboard");
window.location.reload()
    }

  } catch (error) {
    setError(error?.response?.data?.message || "Something went wrong. Please try again.");
  }
};


  return (
    <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-black">
        Create an Account
      </h3>
      <p className="text-xs text-slate-700 mt-[5px] mb-6">
        Join us today by entering your detail below.
      </p>
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <ProfilePhotoSelector image={profilepic} setimage={setProfilepic} />

        <div className="grid grid-cols-1 gap-2">
          <Input
            type="text"
            value={fullname}
            onChange={setFullname}
            label="Full Name"
            placeholder="John Doe"
          />
          <Input
            type="text"
            value={email}
            onChange={setEmail}
            label="Email Address"
            placeholder="john@email.com"
          />
          <Input
            type="password"
            value={password}
            onChange={setPassword}
            label="Password"
            placeholder="Min 8 characters"
          />
        </div>

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

        <button type="submit" className="btn-primary">
          Signup
        </button>

        <p className="text-[13px] text-slate-800 mt-3">
          Already have an account?{" "}
          <button
            type="button"
            className="text-primary underline cursor-pointer"
            onClick={() => setCurrPage("Login")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
