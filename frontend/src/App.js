import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Explore from "./pages/Explore/Explore";
import Boards from "./pages/Boards/Boards";
import Board from "./pages/Board/Board";
import Shelves from "./pages/Shelves/Shelves"
import Account from "./pages/Account/Account"
import NavbarLayout from './components/Navbar/NavbarLayout';
import LoginSignup from './components/LoginSignup/LoginSignup';

function App() {
  // Determine if the user is logged in
  const isLoggedIn = !!localStorage.getItem("user_token");
  return (
    <Router>
      <Routes>
        <Route element={<NavbarLayout/>}>
          <Route path="/" element={isLoggedIn ? <Navigate replace to="/explore" /> : <LoginSignup />} />
          <Route path="/explore" exact element={<Explore />} />
          <Route path="/shelves" exact element={<Shelves />} />
          <Route path="/boards" exact element={<Boards />} />
          <Route path="/boards/:boardId" exact element={<Board />} />
          <Route path="/account" exact element={<Account />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
