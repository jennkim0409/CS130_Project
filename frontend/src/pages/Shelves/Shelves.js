import React from "react";
import "./Shelves.css";
import Bookshelf from '../../components/Bookshelf/Bookshelf';

function Shelves() {
    return(
        <div className="Library">
            <h2 style={{textAlign: "center"}}>My Shelves</h2>
            <Bookshelf/>
        </div>
    );
}
export default Shelves;