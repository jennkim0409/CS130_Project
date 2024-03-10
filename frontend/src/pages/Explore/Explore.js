import { React, useState } from "react";
import "./Explore.css";
import Recommendations from '../../components/Recommendations/Recommendations';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

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
