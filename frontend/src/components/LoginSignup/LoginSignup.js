import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import './LoginSignup.css'
import user_icon from '../../assets/user.png'
import key_icon from '../../assets/key.png'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginSignup() {
    const [action, setAction] = useState("Sign Up");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const signup = () => {
        if (action === "Login") {
            setAction("Sign Up");
        }
        
        // call backend API to sign up
        else if (username && password) {
            axios.post('http://localhost:5555/auth/register/', { username, password })
            .then(response => {
                console.log("Sign Up successful: ", response.data);
                toast.success("Sign Up was successful!");
                setAction("Login");
            })
            .catch(error => {
                console.error("Sign Up error: ", error);

                // error message
                const error_message = error.response.data.message;
                toast.error(error_message);
            });
        }
    };

    const login = () => {
        if (action === "Sign Up") {
            setAction("Login");
        } 

        // call backend API to log in
        else if (username && password) {
            axios.post('http://localhost:5555/auth/login', { username, password })
            .then(response => {
                console.log("Login successful: ", response.data);
                
                // navigate to main page
                const token = response.data.token;
                const user_id = response.data.user_id;

                localStorage.setItem('user_token', JSON.stringify(token));
                localStorage.setItem('user_id', JSON.stringify(user_id));
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

    const forgot = () => {
        // write code to redirect for forgetting password
    }

    const renderButtons = () => {
        if (action === "Login") {
            // For the Login page, change the order of buttons
            return (
                <>
                    <div className="submit gray" onClick={login}>Login</div>
                    <div className="submit" onClick={signup}>Create an Account</div>
                </>
            );
        } else {
            // For the Sign Up page, keep the original order
            return (
                <>
                    <div className="submit" onClick={signup}>Sign Up</div>
                    <div className="submit gray" onClick={login}>Login to Existing</div>
                </>
            );
        }
    };

    return (
        <div className='container'>
            {/* Will either say sign up or login based on current action */}
            <div className='header'>
                <div className='text'>{action}</div>
            </div>

            <div className="information">
                <div className="leftSide">
                    <div className="page-instructions">
                    Create or log-in to your account to save your bookpins!
                    </div>
                    {
                        action === "Login" && (
                        <span className="forgot-password" onClick={forgot}>Forgot Password?</span>
                    )}
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
                        {renderButtons()}
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default LoginSignup;