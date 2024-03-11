import React from "react";
import "./Explore.css";
import Recommendations from '../../components/Recommendations/Recommendations';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Explore() {

    return(
        <div className="Explore">
            <h2 style={{ textAlign: "center" }}>Explore</h2>    
            <Recommendations/>
            <ToastContainer/>
        </div>

    );
}
export default Explore;
