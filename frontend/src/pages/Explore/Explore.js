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
            </div>
            <br/><br/>
            <Recommendations/>
        </div>

    );
}
export default Explore;
