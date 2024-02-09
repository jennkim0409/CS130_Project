import React, { useState } from "react";
import './LoginSignup.css'
import email_icon from '../../assets/gmail.png'
import user_icon from '../../assets/user.png'
import key_icon from '../../assets/key.png'

function LoginSignup() {
    const [action, setAction] = useState("Sign up");

    const signup = () => {
        if (action === "Login") {
            setAction("Sign up");
        }
        // proceed to have code for signing up
    };

    const login = () => {
        if (action === "Sign up") {
            setAction("Login");
        } 
        // proceed to have code for logging in
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
                    <input type='email' placeholder='Email'/>
                </div>
                }

                {/* Username input */}
                <div className='input'>
                    <img src={user_icon} width={35} height={35} alt='username'/>
                    <input type='text' placeholder='Username'/>
                </div>
                
                {/* Password input */}
                <div className='input'>
                    <img src={key_icon} width={35} height={35} alt='password'/>
                    <input type='password' placeholder='Password'/>
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
        </div>
    );
}

export default LoginSignup;