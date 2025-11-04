import { useState } from "react";
import { APP_FEATURES } from "../../utils/data";
import { useNavigate } from "react-router-dom";
import { LuMoveDiagonal, LuSparkles } from "react-icons/lu";
import Login from "../Auth/Login";
import SignUp from "../Auth/SignUp"
import Modal from "../../components/Modal";
import { UserContext } from "../../context/Usercontext";
import { useContext } from "react";
import ProfileInfoCard from "../../components/Cards/ProfileInfoCard";
const Landingpage = () => {
   const {user}=useContext(UserContext);
   
  const navigate = useNavigate();
  const [openAuthmodal, setopenAuthmodal] = useState(false);
  const [currPage, setCurrPage] = useState("Login");

  const handleCTA = () => {
    if (!user) {
      setopenAuthmodal(true);
    }else
    {
       navigate("/dashboard");
    }


  };

  return (
    <>
      <div className="w-full min-h-screen bg-[#FFFCEF] relative overflow-hidden">
        {/* Blurred Background */}
        <div className="w-[500px] h-[500px] bg-amber-200/20 blur-[65px] absolute top-0 left-0"></div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pt-6 pb-[200px] relative z-10">
          {/* Header */}
          <header className="flex justify-between items-center mb-16">
            <div className="text-black font-bold text-lg">
              Interview prep AI
            </div>
            {user ? (<ProfileInfoCard/>):(<button
              className="bg-gradient-to-r from-[#FF9324] to-[#e99ab4b] text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-black hover:text-white border border-white transition-colors cursor-pointer"
              onClick={() => setopenAuthmodal(true)}
            >
              Login / Sign up
            </button>)}
          </header>

          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center">
            {/* Left Side */}
            <div className="w-full md:w-1/2 pr-4 mb-8 md:mb-0">
              <div className="flex items-center mb-2">
                <div className="flex items-center gap-2 text-[13px] text-amber-600 font-semibold bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  <LuSparkles /> AI Powered
                </div>
              </div>
              <h1 className="text-5xl text-black font-medium mb-6 leading-tight">
                Ace Interview with
                <br />
                <span className="text-transparent bg-clip-text bg-[radial-gradient(circle,_#FF0325_0%,_#FCD760_100%)] bg-[length:200%_200%] animate-text-shine font-semibold">
                  AI-Powered
                </span>{" "}
                Learning
              </h1>
            </div>

            {/* Right Side */}
            <div className="w-full md:w-1/2">
              <p className="text-[17px] text-gray-900 mr-0 md:mr-20 mb-6">
                Get role-specific questions, expand answers when you need them,
                dive deeper into concepts, organize everything your way. From
                preparation to mastery – your ultimate interview toolkit is
                here.
              </p>
              <button
                className="bg-black text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-yellow-100 hover:text-black border border-yellow-300 transition-colors cursor-pointer"
                onClick={handleCTA}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

     <div className="w-full min-h-full relative z-10">
      <div>
      <section className="flex items-center justify-center -mt-36">
    <img src="/image.avif" alt="AI Interview" className="w-[50vw] rounded-lg" />
      </section>
      </div>

      <div className="w-full min-h-full bg-[#FFFCEF] mt-[10">
        <div className="container mx-auto px-4 pt-10 pb-20">
          <section className="mt-5">
            <h2 className="text-2xl font-medium text-center mb-12">
              Feature That Make you Shine
            </h2>
             <div className="flex flex-col items-center gap-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                {APP_FEATURES.slice(0,3).map((feature)=>(
                  <div key={feature.id} className="bg-[#FFFEF8] p-6 rounded-xl shadow-xs hover:show-amber-100 transition border-amber-100 ">
                    <h3 className="text-base font-semibold mb-3">
                       {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                    </div>
                ))}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {APP_FEATURES.slice(3).map((feature)=>(
                  <div key={feature.id} className="bg-[#FFFEF8] p-6 shadow-xs hover:shadow-lg shadow-amber-100 transition border border-amber-100">
                    <h3 className="text-base font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                    </div>
                ))}
               </div>
             </div>
          </section>
        </div>
      </div>
       <div className="text-sm bg-gray-50 text-secodary text-center p-5 mt-5"> 
        Made with 💖...Happing Coding
        </div>
    </div>

    <Modal 
  isOpen={openAuthmodal}
  onClose={() => {
    setopenAuthmodal(false);
    setCurrPage("Login");
  }}
  title={currPage === "Login" ? "Login" : "Signup"}  
>
  <div>
    {currPage === "Login" && (<Login setCurrPage={setCurrPage} />)}
    {currPage === "Signup" && (<SignUp setCurrPage={setCurrPage} />)}
  </div>
</Modal>

    </>
  );
};

export default Landingpage;
