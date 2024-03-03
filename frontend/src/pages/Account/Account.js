import React, {useState} from "react";
import "./Account.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Account(props) {
    const navigate = useNavigate();
    const [name, updateName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPassword2, setNewPassword2] = useState('');

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
        if (name != '') {
            // update the name in backend
            const path = 'http://localhost:5555/api/user/set/' + localStorage.getItem("user_id").replace(/"/g, ''); // gets rid of double quotes in user_id
            axios.patch(path,
                { name: name },
                {
                headers: {
                    Authorization: localStorage.getItem("user_token")
                }
            })
            .then(response => {
                console.log("Name saved successfully: ", response.data);
                localStorage.setItem('user_name', name);
            })
            .catch(error => {
                console.error("Error saving name: ", error);

                // error message
                const error_message = error.response.data.message;
                toast.error(error_message);
            });            
        }
        if (currentPassword != '' && newPassword != '' && newPassword2 != '') {
            // grab password from backend and check that it's correct
            // check to see if newPassword and newPassword2 are the same and if so, update password in backend
        }

    }
    return(
        <div className="account">
            <h2 style={{textAlign: "center"}}>Account</h2>
            <h2 style={{margin: '0px'}}>Welcome Back, {localStorage.getItem('user_name')}!</h2>
            <div className="update-name">
                <h3 style={{textAlign: "center", paddingTop: '15px'}}>Update Name</h3>
                <div className='account-input'>
                    <h4>Name</h4>
                    <input 
                    type='text'
                    value={name}
                    onChange={(e) => updateName(e.target.value)}
                    />
                </div>
            </div>
            <div className="update-password">
                <h3 style={{textAlign: "center", paddingTop: '15px'}}>Update Password</h3>
                <div className='account-input'>
                    <h4>Current Password</h4>
                    <input 
                    type='text'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>
                <div className='account-input'>
                    <h4 >New Password</h4>
                    <input 
                    type='text'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div className='account-input'>
                    <h4>Re-enter New Password</h4>
                    <input 
                    type='text'
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