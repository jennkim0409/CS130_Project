import React, {useState, useEffect} from "react";
import "./Account.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Account(props) {
    const navigate = useNavigate();
    const [nameInput, setNameInput] = useState('');
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPassword2, setNewPassword2] = useState('');

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        if (storedName) {
            setName(storedName);
        }
    }, []);

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
                toast.error("The new passwords you provided do not match.");
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
                        throw error;
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
                        throw error;
                    })
            );
        }
    
        Promise.all(promises)
            .then(() => {
                toast.success("Account preferences successfully updated!");
            })
            .catch(error => {
                console.error("Error during update: ", error);
                const error_message = error.response.data.message;
                toast.error(error_message);                
            });
    };

    return(
        <div className="account">
            <h2 style={{textAlign: "center"}}>Account</h2>
            <h2 style={{margin: '0px'}}>Welcome Back, {name}!</h2>
            <div className="update-name">
                <h3 style={{textAlign: "center", paddingTop: '15px'}}>Update Name</h3>
                <div className='account-input'>
                    <h4>Name</h4>
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
                    <h4>Current Password</h4>
                    <input 
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>
                <div className='account-input'>
                    <h4 >New Password</h4>
                    <input 
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div className='account-input'>
                    <h4>Re-enter New Password</h4>
                    <input 
                    type='password'
                    value={newPassword2}
                    onChange={(e) => setNewPassword2(e.target.value)}
                    />
                </div>
            </div>
            <div className="account-buttons">
                <div className="submit" onClick={update} >Update</div>
                <div className="submit gray" onClick={signout}>Sign Out</div>
            </div>
        </div>
    );
}
export default Account;