import { React, useState } from "react";
import "./Explore.css";
import Recommendations from '../../components/Recommendations/Recommendations';
import GenrePreferences from '../../components/GenrePreferences/GenrePreferences';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function Explore() {
    const [genrePreferences, setGenrePreferences] = useState([]);

    function saveGenrePrefs() {
        // save genre preferences in backend
        const genrePrefsArray = genrePreferences.map(pref => pref.value);
        const path = 'http://localhost:5555/api/user/set/' + localStorage.getItem("user_id").replace(/"/g, ''); // gets rid of double quotes in user_id
        axios.patch(path,
            { genrePrefs: genrePrefsArray },
            {
              headers: {
                Authorization: localStorage.getItem("user_token")
              }
            }
        )
        .then(response => {
            console.log("Genre preferences saved successfully: ", response.data);
        })
        .catch(error => {
            console.error("Error saving genre preferences: ", error);
            const error_message = error.response.data.message;
            toast.error(error_message);
            return;
        });

        // update recommended shelf to be empty
        // when we reload the page, new recommendations will be fetched
        axios.post('http://localhost:5555/api/handlebooks/clearBookshelf/', 
            { userId: localStorage.getItem("user_id").replace(/"/g, ''), bookshelfType: "recommended" }, 
            {
            headers: {
                Authorization: localStorage.getItem("user_token")
            }
        })
        .then(response => {
            console.log("Old recommended bookshelf cleared: ", response.data);
        })
        .catch(error => {
            console.error("Error clearing old recommended bookshelf: ", error.response);
            return;
        });

        toast.success("Genre preferences saved!");
        toast.info("Reload the page to get new book recommendations.")
    }

    return(
        <div className="Explore">
            <h2 style={{ textAlign: "center" }}>Explore</h2>      
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", paddingLeft: "30%" }}>
                    <GenrePreferences return_genres={setGenrePreferences} />
                    <h5 style={{ paddingRight: "40%" }}>Optional: Select above if you want to add additional genre preferences. Otherwise, we will use your previous history of them!</h5>
                    <div style={{ display: "flex", justifyContent: "center", width: "42vw" }}>
                        <div className="submit gray" style={{ width: "15vw" }} onClick={saveGenrePrefs}>Save</div>
                    </div>
                </div>
            </div>
            <br/><br/>
            <Recommendations/>
            <ToastContainer/>
        </div>

    );
}
export default Explore;
