import Select from 'react-select';
import React, { useState } from "react";
import './SignupPersonalize.css'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const genreOptions = [
    { label: 'fiction', value: 'fiction' },
    { label: 'mystery', value: 'mystery' },
    { label: 'romance', value: 'romance' },
    { label: 'science fiction', value: 'science fiction' },
    { label: 'fantasy', value: 'fantasy' },
    { label: 'thriller', value: 'thriller' },
    { label: 'horror', value: 'horror' },
    { label: 'historical fiction', value: 'historical fiction' },
    { label: 'non-fiction', value: 'non-fiction' },
    { label: 'biography', value: 'biography' },
    { label: 'autobiography', value: 'autobiography' },
    { label: 'memoir', value: 'memoir' },
    { label: 'self-help', value: 'self-help' },
    { label: 'young adult', value: 'young adult' },
    { label: "children's literature", value: "children's literature" },
    { label: 'poetry', value: 'poetry' },
    { label: 'comedy', value: 'comedy' },
    { label: 'drama', value: 'drama' },
    { label: 'adventure', value: 'adventure' },
    { label: 'crime', value: 'crime' },
];

const selectStyles = {
    container: (provided) => ({
        ...provided,
        width: '50%', // side of select bar
        minWidth: '200px', // ensure it doesn't get too small
        textAlign: "center",
    }),
    control: (provided) => ({
        ...provided,
        borderRadius: "10px",
        width: '100%',
    }),
};

function SignupPersonalize() {
    const [bookName, setBookName] = useState('');
    const navigate = useNavigate();

    const search = (name) => {
        {/* code to search up a book from database*/}
    };

    const save = () => {
        { 
        /* for now, only save the name and genre preferences. 
        "books you enjoy" part will be handled after we work on Shelves page 
        since the user doesn't have to login again after onboarding, could we get backend to
        return user_token and user_id when the name is sent to database?
        */
        }
        navigate('/explore');
    };

    return (
        <div className="personalize-container">
            <div className="header">
                <div className="text">Account Preferences</div>
            </div>

            <div className="information">
                <div className="leftSide">
                    <div className="personalize-instructions">
                    One last step! Please tell us more about yourself :)
                    </div>
                </div>
                <div className="rightSide">
                    <div className="inputs-personalize">
                        <div className='name-edit'>
                            <h4>Name</h4>
                            <input type='text'/>
                        </div>
                        <div className="genre-select">
                            <h4>Genre Preferences</h4>
                            <Select 
                                className='dropdown' 
                                options={genreOptions} 
                                onChange={opt => console.log(opt)}
                                isMulti
                                menuPlacement="auto"
                                styles={selectStyles}
                                theme={(theme) => ({
                                    ...theme,
                                    borderRadius: 0,
                                    colors: {
                                        ...theme.colors,
                                        /* when hovering */
                                        primary25: '#97AD97',
                                        /* when clicking */
                                        primary50: '#97AD97',
                                        /* border color of the select dropbox */
                                        primary: '#F0ABFB',
                                    },
                                    })}
                            />
                        </div>
                        <div className="search-books">
                                <h4>Books You Enjoy</h4>
                                <div className="book-retrieve">
                                    <input 
                                    type='text' 
                                    value={bookName}
                                    onChange={(e) => setBookName(e.target.value)}
                                    />
                                    <div className="search-button" 
                                    onClick={search(bookName)}
                                    >Search</div>
                                </div>
                        </div>
                    </div>
                    <div className='save-button'>
                        <div className="submit-personalize" onClick={save}>Done!</div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default SignupPersonalize;
