import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import './LoginSignup.css'
import user_icon from '../../assets/user.png'
import key_icon from '../../assets/key.png'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginSignup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const signup = () => {
        // call backend API to sign up
        if (username && password && password.length >= 8) {
            axios.post('http://localhost:5555/auth/register/', { username, password })
            .then(response => {
                console.log("Sign Up successful: ", response.data);

                const token = response.data.token;
                const user_id = response.data.user.id;

                localStorage.setItem('user_token', token);
                localStorage.setItem('user_id', user_id);

                toast.success("Sign Up was successful!", {
                    autoClose: 2000,
                    pauseOnHover: false,
                    onClose: () => navigate("/personalize") // redirect to onboarding page
                  });
            })
            .catch(error => {
                console.error("Sign Up error: ", error);

                // error message
                const error_message = error.response.data.message;
                toast.error(error_message);
            });
        }
        else {
            // Password doesn't meet the minimum length requirement
            toast.error("Password must be at least 8 characters long.");
        }
    };

    const login = () => {
        // call backend API to log in
        if (username && password) {
            axios.post('http://localhost:5555/auth/login', { username, password })
            .then(response => {
                console.log("Login successful: ", response.data);
            
                const token = response.data.token;
                const user_id = response.data.user_id;

                localStorage.setItem('user_token', token);
                localStorage.setItem('user_id', user_id);
                navigate("/explore"); // *** eventually pass User object here
            })
            .catch(error => {
                console.error("Login error: ", error.response);
                
                // error message
                const error_message = error.response.data.message;
                toast.error(error_message);
            });
        }
    };

    return (
        <div className='container'>
            {/* Will either say sign up or login based on current action */}
            <div className='header'>
                <div className='text'>Account</div>
            </div>

            <div className="information">
                <div className="leftSide" style={{flexDirection: 'column'}}>
                    <div className="page-instructions">
                    Create or log-in to your account to save your bookpins!
                    </div>
                </div>
                <div className="rightSide">
                    {/* Inputs that should be entered by the user */}
                    <div className='inputs'>

                        {/* Username input */}
                        <div className='input'>
                            <img src={user_icon} width={35} height={35} alt='username'/>
                            <input type='text' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)}/>
                        </div>
                        
                        {/* Password input */}
                        <div className='input'>
                            <img src={key_icon} width={35} height={35} alt='password'/>
                            <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                    </div>

                    {/* Either user is switching the action or choosing to login or sign up */}
                    <div className='submit-container'>
                        <div className="submit" onClick={signup}>Sign Up</div>
                        <div className="submit gray" onClick={login}>Login</div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default LoginSignup;