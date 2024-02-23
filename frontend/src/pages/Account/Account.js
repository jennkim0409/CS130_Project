import React from "react";
import "./Account.css";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Account(props) {
    const navigate = useNavigate();
    const signout = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            localStorage.clear();
            props.signOut();
            toast.info("Signing you out", {
                onClose: () => navigate('/'), 
                autoClose: 2000,
                pauseOnHover: false,
            });
        }
    }
    return(
        <div className="account">
            <h2 style={{textAlign: "center"}}>Account</h2>
            <div className="submit gray" onClick={signout}>Sign Out</div>
        </div>
    );
}
export default Account;