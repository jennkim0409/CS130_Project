import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import './LoginSignup.css'
import email_icon from '../../assets/gmail.png'
import user_icon from '../../assets/user.png'
import key_icon from '../../assets/key.png'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginSignup() {
    const [action, setAction] = useState("Sign up");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const signup = () => {
        if (action === "Login") {
            setAction("Sign up");
        }
        
        // call backend API to sign up
        if (username && password && email) {
            axios.post('http://localhost:5555/auth/register/', { username, password, email })
            .then(response => {
                console.log("Sign up successful: ", response.data);
                toast.success("Sign up was successful!");
                setAction("Login");
            })
            .catch(error => {
                console.error("Sign up error: ", error);
            });
        }
    };

    const login = () => {
        if (action === "Sign up") {
            setAction("Login");
        } 

        // call backend API to log in
        if (username && password) {
            axios.post('http://localhost:5555/auth/login', { username, password })
            .then(response => {
                console.log("Login successful: ", response.data);
                // navigate to main page
                const token = response.data.token;
                console.log(token);
                localStorage.setItem('user_token', JSON.stringify(token));
                navigate("/explore"); // *** eventually pass User object here
            })
            .catch(error => {
                console.error("Login error: ", error);
            });
        }
    };

    const forgot = () => {
        // write code to redirect for forgetting password
    }

    return (
        <div className='container'>
            {/* Will either say sign up or login based on current action */}
            <div className='header'>
                <div className='text'>{action}</div>
            </div>

            {/* Inputs that should be entered by the user */}
            <div className='inputs'>

                {/* If login action, then shouldn't have email input show up */}
                {
                action === "Login" ? 
                <div></div> :
                <div className='input'>
                    <img src={email_icon} width={35} height={35} alt='email'/>
                    <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
                }

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

            <div className='forgot-password'>Forgot Password? <span onClick={forgot}>Click Here</span></div>

            {/* Either user is switching the action or choosing to login or sign up */}
            <div className='submit-container'>
                <div className={action==="Sign up" ? "submit" : "submit gray"}
                    onClick={signup}
                >Sign up</div>
                <div className={action==="Login" ? "submit" : "submit gray"}
                    onClick={login}
                >Login</div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default LoginSignup;