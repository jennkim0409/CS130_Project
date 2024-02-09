import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Explore from "./pages/Explore/Explore";
import Saved from "./pages/Saved/Saved"
import Navbar from './components/Navbar/Navbar';
import NavbarLayout from './components/Navbar/NavbarLayout';
import LoginSignup from './components/LoginSignup/LoginSignup';

function App() {
  /* Something to note about this. Currently, when we run React, we're always redirected
  to the path with / aka home. But we ideally want to get this redirected to login/signup 
  first. But I can only make that adjustment once login/signup credentials are working in backend */
  return (
    <Router>
      <Routes>
        <Route path="/login" exact element={<LoginSignup />} />
        <Route element={<NavbarLayout/>}>
          <Route path="/" exact element={<Explore />} />
          <Route path="/saved" exact element={<Saved />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
