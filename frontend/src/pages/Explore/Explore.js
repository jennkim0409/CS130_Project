import { React, useState } from "react";
import "./Explore.css";
import Recommendations from '../../components/Recommendations/Recommendations';
import GenrePreferences from '../../components/GenrePreferences/GenrePreferences';

function Explore() {
    const [genrePreferences, setGenrePreferences] = useState([]);

    return(
        <div className="Explore">
            <h2 style={{ textAlign: "center" }}>Explore</h2>
            
            <div style={{ display: "flex", flexDirection: "column", paddingLeft: "30%" }}>
                <GenrePreferences return_genres={setGenrePreferences} />
                <h5 style={{ paddingRight: "40%" }}>Optional: If you do not select from this list, we will work with your previous genre preferences!</h5>
            </div>
            <br/><br/>
            <Recommendations/>
        </div>

    );
}
export default Explore;
