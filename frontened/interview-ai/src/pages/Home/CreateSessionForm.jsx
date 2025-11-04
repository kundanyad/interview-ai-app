import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { SpinnerLoaderLarge } from '../../components/Loaders/SpinnerLoader';
import axiosInstance from "../../utils/axiosInstance" 
import { API_PATHS } from '../../utils/apiPaths';

export const CreateSessionForm = () => {
  const [formData, setFormData] = useState({
  role: "",
  experience: "",
  topicsToFocus: "",   
  description: "",
});
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState("");
    const navigate = useNavigate();

    const handleChange = (key, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [key]: value,
        }));
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();

        const { role, experience, topicsToFocus, description } = formData;  

        if (!role || !experience || !topicsToFocus || !description) {
            setErrors("please fill all the required fields");
            setIsLoading(false);
            return;
        }

        setErrors("");
        setIsLoading(true);

        try {
           const aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
    role,
    experience,
    topicsToFocus,  
    numberOfQuestions: 10,
});

            const generatedQuestions = aiResponse.data;

            const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
                ...formData,
                questions: generatedQuestions,
            });

            if (response.data?.session?._id) {
                navigate(`/interview-prep/${response.data?.session?._id}`);
            }
        } catch (error) {
            if (error.response && error.response.data.message) {
                setErrors(error.response.data.message);
            } else {
                setErrors("something went wrong.please try again");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='w-[90vw] md:w-[35vw] p-7 flex flex-col justify-center'>
            <h3 className='text-lg font-semibold text-black'>
                start a new interview journey
            </h3>
            <p className='text-xs text-slate-700 mt-[5px] mb-3'>
                Fill out a few quick details and unlock your personalized set of interview questions.
            </p>
            <form onSubmit={handleCreateSession} className='flex flex-col gap-3'>
                <Input
                    value={formData.role}
                    onChange={(val) => handleChange("role", val)}
                    lable="Target Role"
                    placeholder="(e.g.,Frontend Developer, UI/UX Designer, etc.)"
                    type="text"
                />
                <Input
                    value={formData.experience}
                    onChange={(val) => handleChange("experience", val)}
                    lable="Year of Experience"
                    placeholder="(e.g.,1, 2, etc.)"
                    type="number"
                />
                <Input
                    value={formData.topicsToFocus}
                    onChange={(val) => handleChange("topicsToFocus", val)}
                    lable="Topics to Focus On"
                    placeholder="(e.g.,React, Node.js, System Design, etc.)"
                    type="text"
                />
                <Input
                    value={formData.description}
                    onChange={(val) => handleChange("description", val)}
                    lable="Brief Description"
                    placeholder="(e.g.,I am preparing for a frontend developer role at a FAANG company.)"
                    type="text"
                />
                {errors && <p className='text-red-500 text-xs pb-2.5'>{errors}</p>}
                <button type="submit" disabled={isLoading} className='btn-primary mt-2 w-full'>
                    {isLoading && <SpinnerLoaderLarge />}
                    Create Session
                </button>
            </form>
        </div>
    )
}
