import React from "react";
import "./Explore.css";
import Bookshelf from '../../components/Bookshelf/Bookshelf';

function Explore() {
    return(
        <div className="Library">
            <h2 style={{textAlign: "center"}}>My Shelves</h2>
            <Bookshelf/>
        </div>
    );
}
export default Explore;