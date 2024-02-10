import React from "react";
import "./Boards.css";
import { useNavigate } from "react-router-dom";

function Boards() {
    const navigate = useNavigate();
    return(
        <div className="Boards">
            <h1>This is the Home Page for Pinterest Boards</h1>
            <button onClick={()=> navigate("/boards/hello")}>HELLO</button>
            <button onClick={()=> navigate("/boards/test")}>TEST</button>
            <button onClick={()=> navigate("/boards/yay")}>YAY</button>
        </div>
    );
}
export default Boards;