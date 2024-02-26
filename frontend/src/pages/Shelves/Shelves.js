import React, {useState} from "react";
import "./Shelves.css";
import Bookshelf from '../../components/Bookshelf/Bookshelf';

function Shelves() {
    const [searchTerm, setSearchTerm] = useState('');

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            search(); // Implement the search method according to your needs
        }
    }

    const handleTermChange = (e) => {
        setSearchTerm(e.target.value);
    }

    const search = () => {
        console.log('The title we should search for: ', searchTerm);
    }

    return(
        <div className="Library">
            <h2 style={{textAlign: "center"}}>My Shelves</h2>
            <div className="items">
            <div className="search-bar">
                <input placeholder="Search for a book by title" onChange={handleTermChange} onKeyUp={handleKeyPress}/>
            </div>
            <Bookshelf/>
            </div>
        </div>
    );
}
export default Shelves;