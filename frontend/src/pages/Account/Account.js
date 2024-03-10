import React, {useState, useEffect} from "react";
import "./Account.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import expiredToken from '../../components/ExpiredToken';
import GenrePreferences from '../../components/GenrePreferences/GenrePreferences';


function Account(props) {
    const navigate = useNavigate();
    const [nameInput, setNameInput] = useState('');
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [genrePreferences, setGenrePreferences] = useState([]);

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        if (storedName) {
            setName(storedName);
        }
    }, []);

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

    const signout = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            localStorage.clear();
            props.signOut();
            toast.info("Signing you out", {
                onClose: () => navigate('/'), 
                autoClose: 2000,
                pauseOnHover: false,
            });
        }
    }

    const update = () => {
        const promises = [];
    
        // update password in backend
        if (currentPassword !== '' && newPassword !== '' && newPassword2 !== '') {
            if (newPassword !== newPassword2) {
                toast.error("The new passwords you provided do not match.", {
                    autoClose: 2000,
                });
                return;
            }
    
            const passwordPath = 'http://localhost:5555/api/user/resetpass/' + localStorage.getItem("user_id").replace(/"/g, '');
            promises.push(
                axios.patch(passwordPath,
                    { currentPassword: currentPassword, newPassword: newPassword, re_newPassword: newPassword2 },
                    {
                        headers: {
                            Authorization: localStorage.getItem("user_token")
                        }
                    })
                    .then(response => {
                        console.log("Password saved successfully: ", response.data);
                    })
                    .catch(error => {
                        if (error.response.data.message === "Unauthorized- Invalid Token" || 
                            error.response.data.message === "Unauthorized- Missing token") {
                            expiredToken();
                        } else {
                        throw error;
                        }
                    })
            );
        }
    
        // update name in backend
        if (nameInput !== '') {
            const namePath = 'http://localhost:5555/api/user/set/' + localStorage.getItem("user_id").replace(/"/g, '');
            promises.push(
                axios.patch(namePath,
                    { name: nameInput },
                    {
                        headers: {
                            Authorization: localStorage.getItem("user_token")
                        }
                    })
                    .then(response => {
                        console.log("Name saved successfully: ", response.data);
                        localStorage.setItem('user_name', nameInput);
                        setName(nameInput);
                    })
                    .catch(error => {
                        if (error.response.data.message === "Unauthorized- Invalid Token" || 
                            error.response.data.message === "Unauthorized- Missing token") {
                            expiredToken();
                        } else {
                        throw error;
                        }
                    })
            );
        }
    
        Promise.all(promises)
            .then(() => {
                toast.success("Account preferences successfully updated!", {
                    autoClose: 2000,
                    pauseOnHover: false,
                });
            })
            .catch(error => {
                console.error("Error during update: ", error);
                const error_message = error.response.data.message;
                toast.error(error_message, {
                    autoClose: 2000,
                });             
            });
    };

    return(
        <div style={{display: 'flex', justifyContent: 'center'}}>
            <div style={{width: "60vw", minWidth: "600px"}}>
                <h2 style={{textAlign: "center"}}>Account</h2>
                <h2 style={{margin: '0px', textAlign: "center"}}>Welcome Back, {name}!</h2>
                <br/><br/>
                <div style={{ display: 'flex' }}>
                    <div className="account" style={{width: '50%'}}>
                        <div className="update-name">
                            <h3 style={{textAlign: "center"}}>Update Name</h3>
                            <div className='account-input'>
                                <h4 style={{marginBottom: '5px'}}>Name</h4>
                                <input 
                                type='text'
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="update-password">
                            <h3 style={{textAlign: "center", paddingTop: '15px'}}>Update Password</h3>
                            <div className='account-input'>
                                <h4 style={{marginBottom: '5px'}}>Current Password</h4>
                                <input 
                                type='password'
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            <div className='account-input'>
                                <h4 style={{marginBottom: '5px'}}>New Password</h4>
                                <input 
                                type='password'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className='account-input'>
                                <h4 style={{marginBottom: '5px'}}>Re-enter New Password</h4>
                                <input 
                                type='password'
                                value={newPassword2}
                                onChange={(e) => setNewPassword2(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="account-buttons">
                            <div className="submit" onClick={update} >Update</div>
                        </div>
                    </div>

                    <div style={{width: '50%'}}>
                        <h3 style={{ textAlign: "center" }}>Genre Preferences</h3>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <GenrePreferences return_genres={setGenrePreferences} />
                            <h5 style={{ width: "30vw", minWidth: '300px' }}>Optional: Select above if you want to add additional genre preferences. Otherwise, we will use your previous history of them!</h5>
                            <div style={{ display: "flex" }}>
                                <div className="submit" onClick={saveGenrePrefs}>Save</div>
                            </div>
                        </div>
                        <h3 style={{ textAlign: "center", paddingTop: '15px' }}>Manage Account</h3>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div className="submit gray" onClick={signout}>Sign Out</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        
        
    );
}
export default Account;