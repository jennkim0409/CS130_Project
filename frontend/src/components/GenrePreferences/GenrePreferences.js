import Select from 'react-select';
import React, { useState, useEffect } from "react";

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

// style for react-select component
const selectStyles = {
    container: (provided) => ({
        ...provided,
        width: '60%', 
        minWidth: '300px',
        textAlign: "center",
    }),
    control: (provided) => ({
        ...provided,
        borderRadius: "10px",
        width: '100%',
    }),
};

function GenrePreferences({return_genres}) {
    return(
        <div className="genre">
            <h4>Genre Preferences</h4>
            <Select 
                className='dropdown' 
                options={genreOptions} 
                onChange={opt => return_genres(opt)}
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
    );
}

export default GenrePreferences;