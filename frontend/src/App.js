import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Explore from "./pages/Explore/Explore";
import Boards from "./pages/Boards/Boards";
import Board from "./pages/Board/Board";
import Shelves from "./pages/Shelves/Shelves"
import Account from "./pages/Account/Account"
import NavbarLayout from './components/Navbar/NavbarLayout';
import LoginSignup from './components/LoginSignup/LoginSignup';
import SignupPersonalize from './components/SignupPersonalize/SignupPersonalize';
import { ToastContainer } from 'react-toastify';

function App({ testRouterProps }) {
  const isTestEnv = process.env.NODE_ENV === 'test';
  const Router = isTestEnv ? MemoryRouter : BrowserRouter;

  // Determine if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user_token"));

  useEffect(() => {
    // handle storage events
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("user_token"));
    };

    // event
    window.addEventListener('storage', handleStorageChange);

    // cleanup when component is unmounted
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router {...testRouterProps}>
      <Routes>
        <Route element={<NavbarLayout/>}>
          <Route path="/" element={isLoggedIn ? <Navigate replace to="/explore" /> : <LoginSignup />} />
          <Route path="/personalize" exact element={<SignupPersonalize />} />
          <Route path="/explore" exact element={<Explore />} />
          <Route path="/shelves" exact element={<Shelves />} />
          <Route path="/boards" exact element={<Boards />} />
          <Route path="/boards/:userId/:boardId" exact element={<Board />} />
          <Route path="/account" element={<Account signOut={() => setIsLoggedIn(false)} />} />
        </Route>
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
