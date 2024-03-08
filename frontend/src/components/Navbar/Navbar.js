import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("user_token");

    return <nav className="nav">
        <div className="navbar">
            <div className="logo" onClick={()=>{isLoggedIn ? navigate('/explore') : navigate('/')}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0L13.4164 7.64074L19.0534 2.2918L15.7082 9.30583L23.4127 8.2918L16.5836 12L23.4127 15.7082L15.7082 14.6942L19.0534 21.7082L13.4164 16.3593L12 24L10.5836 16.3593L4.94658 21.7082L8.2918 14.6942L0.587322 15.7082L7.41641 12L0.587322 8.2918L8.2918 9.30583L4.94658 2.2918L10.5836 7.64074L12 0Z" fill="#337032"/>
                </svg>
                <div className="site-title">bookpins</div>
            </div>
            
            {(location.pathname !== "/" && location.pathname !== "/personalize") && (
                <>
                <div className="section">
                    <div className="option">
                        <a href="/explore">Explore</a>
                    </div>
                    <div className="option">
                        <a href="/shelves">Shelves</a>
                    </div>
                    <div className="option">
                        <a href="/boards">Boards</a>
                    </div>
                </div>
                <div className="profile">
                    <div className="account">
                        <a href="/account">Account</a>
                    </div>
                    <div className="dot">
                        <span className="dot"></span>
                    </div>
                </div>
                </>
            )}
        </div>
    </nav>
}