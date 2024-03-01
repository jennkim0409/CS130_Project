import React from "react";
import "./Explore.css";
import Recommendations from '../../components/Recommendations/Recommendations';

function Explore() {
    return(
        <div className="Explore">
            <h2 style={{textAlign: "center"}}>Explore</h2>
            <Recommendations/>
        </div>
    );
}
export default Explore;