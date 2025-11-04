import React, { createContext, useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
 

export const UserContext = createContext();

 

const UserProvider = ({ children }) => {
    const [user, setuser] = useState(null);
    const [loading, setloading] = useState(true);

    useEffect(() => {
        if (user) {
            setloading(false);
            return;
        }
        const accesstoken = localStorage.getItem("token");
        if (!accesstoken) {
            setloading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
                setuser(response.data);
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
                clearUser();
            } finally {
                setloading(false);
            }
        };
        fetchUser();
    }, [user]);

    const updateUser = (userData) => {
        setuser(userData);
        if (userData.token) {
            localStorage.setItem("token", userData.token);
        }
        setloading(false);
    };

    const clearUser = () => {
        setuser(null);
        localStorage.removeItem("token");
        setloading(false);
    };

    return (
        <UserContext.Provider value={{ user, loading, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
}
export default UserProvider;

/* Sample cURL command for logging in
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"yadavkundan224@gmail.com\",\"password\":\"kundan@123\"}"
*/