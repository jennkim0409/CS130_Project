import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Explore from "./pages/Explore/Explore";
import Saved from "./pages/Saved/Saved"
import Navbar from './components/Navbar/Navbar';
import NavbarLayout from './components/Navbar/NavbarLayout';
import LoginSignup from './components/LoginSignup/LoginSignup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<LoginSignup />} />
        <Route element={<NavbarLayout/>}>
          <Route path="/explore" exact element={<Explore />} />
          <Route path="/saved" exact element={<Saved />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
