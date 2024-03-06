import React, {useState, useEffect} from 'react'
import './Modal.css';
import remove from '../../assets/remove.png';
import upload from '../../assets/cloud-computing.png';
import _uniqueId from 'lodash/uniqueId';
import Toggle from 'react-toggle';
import "react-toggle/style.css"
import { ChromePicker } from 'react-color'
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

function upload_img(event, pinDetails, setPinDetails, setShowLabel, setShowModalPin, setImageUploaded) {
    if (event.target.files && event.target.files[0]) {
        // if type of the file is image/* where * can be PNG, GIF, etc.
        // then we can upload
        if (/image\/*/.test(event.target.files[0].type)) {
            const reader = new FileReader();

            // once the file is read, we set Pin Details
            // use old pinDetails info if already present and set img_blob to image
            reader.onload = function() {
                setPinDetails({
                    ...pinDetails,
                    img_blob: reader.result
                });
                setShowLabel(false);
                setShowModalPin(true);
                setImageUploaded(true);
            }

            reader.readAsDataURL(event.target.files[0]);
        }
    }
}

function remove_image(pinDetails, setPinDetails, setShowLabel, setShowModalPin, setImageUploaded) {
    setPinDetails({
        ...pinDetails,
        img_blob: null
    });
    setShowLabel(true);
    setShowModalPin(false);
    setImageUploaded(false); 
}

function check_size(event) {
    const image = event.target;
    image.classList.add('pin_max_width');
    // checking if image doesn't take up the entire dimension
    // we want max height if it doesn't take up entire dimension but if it does, then keep as width
    if (
        image.getBoundingClientRect().width < image.parentElement.getBoundingClientRect().width ||
        image.getBoundingClientRect().height < image.parentElement.getBoundingClientRect().height
    ) {
        image.classList.remove('pin_max_width');
        image.classList.add('pin_max_height');
    }

    image.style.opacity = 1;
}

function save_pin(pinDetails, add_pin, id) {
    const pinSize = document.querySelector('#pin_size').value;
    const pinTitle = document.querySelector('#pin_title').value;
    if (pinSize === "") {
        toast.error("Please select a size before saving.", {
            autoClose: 2000,
            pauseOnHover: false,
        });
    } 
    else if (pinTitle === "") {
        toast.error("Please enter a title for your pin before saving.", {
            autoClose: 2000,
            pauseOnHover: false,
        });
    }
    else if (pinDetails.img_blob === "") {
        toast.error("Please add an image before saving.", {
            autoClose: 2000,
            pauseOnHover: false,
        });
    }
    else {
        const users_data = {
            ...pinDetails,
            title: pinTitle,
            description: document.querySelector('#pin_description').value,
            pin_size: pinSize,
        }

        add_pin(users_data);
    }
}

function save_pin_text(pinDetails, add_pin, id, textColor) {
    const pinTitle = document.querySelector('#pin_title').value;
    const pinQuote = document.querySelector('#pin_quote').value;
    if (pinTitle === "") {
        toast.error("Please enter a title for your pin before saving.", {
            autoClose: 2000,
            pauseOnHover: false,
        });
    } 
    else if (pinQuote === "") {
        toast.error("Please enter your quote before saving.", {
            autoClose: 2000,
            pauseOnHover: false,
        });
    }
    else {
        const users_data = {
            ...pinDetails,
            title: pinTitle,
            quote: pinQuote,
            text_color: textColor,
        }
        add_pin(users_data);
    }
}

function update_pin(pinDetails, change_pin) {
    const pinSize = document.querySelector('#pin_size').value;
    const pinTitle = document.querySelector('#pin_title').value;
    if (pinSize === "") {
        toast.error("Please select a size before saving.", {
            autoClose: 2000,
            pauseOnHover: false,
        });
    } 
    else if (pinTitle === "") {
        toast.error("Please enter a title for your pin before saving.", {
            autoClose: 2000,
            pauseOnHover: false,
        });
    }
    else if (pinDetails.img_blob === null) {
        toast.error("Please add an image before saving.", {
            autoClose: 2000,
            pauseOnHover: false,
        });
    }
    else {
        const users_data = {
            ...pinDetails,
        }
        change_pin(users_data);
    }
}

function update_pin_text(pinDetails, change_pin) {
    const pinTitle = document.querySelector('#pin_title').value;
    const pinQuote = document.querySelector('#pin_quote').value;
    if (pinTitle === "") {
        toast.error("Please enter a title for your pin before saving.", {
            autoClose: 2000,
            pauseOnHover: false,
        });
    } 
    else if (pinQuote === "") {
        toast.error("Please enter your quote before saving.", {
            autoClose: 2000,
            pauseOnHover: false,
        });
    }
    else {
        const users_data = {
            ...pinDetails,
        }
        change_pin(users_data);
    }
}

function Modal(props) { 
    const initialPinDetails = {
        title: '', // required for all
        ordering_id: '', // required for all
        description: '', // image pin
        img_blob: '', // image pin
        pin_size: '', // image pin
        quote: '', // quote pin
        text_color: '', // quote pin
    };
    const [pinDetails, setPinDetails] = useState(initialPinDetails);
    const [showLabel, setShowLabel] = useState(true);
    const [showModalPin, setShowModalPin] = useState(false);
    const [id] = useState(_uniqueId('pin-'));
    const [imageUploaded, setImageUploaded] = useState(false);
    const [toggleText, setToggleText] = useState(false);
    const [textColor, setTextColor] = useState('#000');

    // listens to whenever editPinDetails changes
    // necessary to set up modal when user clicks on existing pin to edit/view
    useEffect(() => {
        if (props.editPinDetails !== null) {
            // If we are editing a pin, set pinDetails to editPinDetails
            setPinDetails(props.editPinDetails);

            if (props.editPinDetails.quote !== '') {
                setToggleText(true);
                setTextColor(pinDetails.text_color);
            } 
            else {
                setShowModalPin(true);
                setShowLabel(false);
                setImageUploaded(props.editPinDetails.img_blob ? true : false);
            }
        }
    }, [props.editPinDetails]);

    return (
        <div className="add_pin_modal">
            { props.editPinDetails == null ? 
            // WE ARE ADDING A NEW PIN !!!
            <div className="add_pin_container">
                <div className="top">
                    <h5 style={{margin: '5px'}}>Add a Quote Instead</h5>
                    <label className="toggle-button">
                        <Toggle
                            defaultChecked={toggleText}
                            icons={false}
                            onChange={() => setToggleText(!toggleText)}
                        />
                    </label>
                </div>
                { toggleText?
                    <div className="add_pin_details_text">
                        <input placeholder="Add a title" type="text" className="new_pin_input" id="pin_title"/>
                        <textarea placeholder="Enter your Quote or Text" type="text" className="new_pin_input" id="pin_quote"/>
                        <ChromePicker
                            color={textColor}
                            onChangeComplete={(color) => setTextColor(color.hex)}
                        />
                        <div className="submit" onClick={() => save_pin_text(pinDetails, props.add_pin, id, textColor)}>Save</div>
                    </div>
                    :
                    <div className="add_pin_details_image">
                        <div className="side" id="left_side">
                            <div className="section1">
                                { imageUploaded ? 
                                    <div className="pint_mock_icon_container" data-tooltip-id="my-tooltip-1" onClick={() => remove_image(pinDetails, setPinDetails, setShowLabel, setShowModalPin, setImageUploaded)}>
                                        <img src={remove} alt="remove" className="pint_mock_icon_remove" /> 
                                    </div>
                                    : null
                            
                                }
                            </div>
                            <div className="section2">
                                <label htmlFor="upload_img" id="upload_img_label"
                                    style={{
                                        display: showLabel ? 'block' : 'none'
                                    }}
                                >
                                    <div className="upload_img_container">
                                        <div id="dotted_border">
                                            <div className="pint_mock_icon_container">
                                                <img src={upload} alt="upload" className="pint_mock_icon" /> 
                                            </div>        
                                            <div>Click to Upload</div>
                                            <div>Recommendation: Use high quality .jpg less than 20MB</div>    
                                        </div>
                                    </div>
                                    <input onChange=
                                        {event => upload_img(event, pinDetails, setPinDetails, setShowLabel, setShowModalPin, setImageUploaded)}
                                        type="file" name="upload_img" id="upload_img" value=""
                                    />
                                </label>
                                
                                <div className="modal_pin"
                                    style={{
                                        display: showModalPin ? 'block' : 'none'
                                    }}
                                >
                                    <div className="pin_image">
                                        <img onLoad={check_size} src={pinDetails.img_blob} alt="pin_image"/>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="side" id="right_side">
                            <div className="section1">
                                <div className="select_size">
                                    <select defaultValue="Select size" name="pin_size" id="pin_size">
                                        <option value="">Select size</option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                    
                                </div>
                            </div>
                            <div className="section2">
                                <input placeholder="Add a title" type="text" className="new_pin_input" id="pin_title" />
                                <textarea placeholder="What is this pin about?" type="text" className="new_pin_input" id="pin_description" />
                                <div onClick={() => save_pin(pinDetails, props.add_pin, id)} className="save_pin">Save</div>
                            </div>
                        </div>
                    </div>
                }
            </div>
            :
            // WE ARE EDITING OR VIEWING AN EXISTING PIN !!
            <div className="add_pin_container">
                { toggleText?
                    <div className="add_pin_details_text">
                        <input placeholder="Add a title" type="text" className="new_pin_input" id="pin_title" value={pinDetails.title} onChange={(e) => setPinDetails({ ...pinDetails, title: e.target.value })}/>
                        <textarea placeholder="Enter your Quote or Text" type="text" className="new_pin_input" id="pin_quote" value={pinDetails.quote} onChange={(e) => setPinDetails({ ...pinDetails, quote: e.target.value })}/>
                        <ChromePicker
                            color={pinDetails.text_color}
                            onChangeComplete={(color) => setPinDetails({ ...pinDetails, text_color: color.hex })}
                        />
                        <div className="submit" onClick={() => update_pin_text(pinDetails, props.change_pin)}>Update</div>
                    </div>
                    :
                    <div className="add_pin_details_image">
                        <div className="side" id="left_side">
                            <div className="section1">
                                { imageUploaded ? 
                                    <div className="pint_mock_icon_container" data-tooltip-id="my-tooltip-1" onClick={() => remove_image(pinDetails, setPinDetails, setShowLabel, setShowModalPin, setImageUploaded)}>
                                        <img src={remove} alt="remove" className="pint_mock_icon_remove" /> 
                                    </div>
                                    : null
                                }
                            </div>
                            <div className="section2">
                                <label htmlFor="upload_img" id="upload_img_label"
                                    style={{
                                        display: showLabel ? 'block' : 'none'
                                    }}
                                >
                                    <div className="upload_img_container">
                                        <div id="dotted_border">
                                            <div className="pint_mock_icon_container">
                                                <img src={upload} alt="upload" className="pint_mock_icon" /> 
                                            </div>        
                                            <div>Click to Upload</div>
                                            <div>Recommendation: Use high quality .jpg less than 20MB</div>    
                                        </div>
                                    </div>
                                    <input onChange=
                                        {event => upload_img(event, pinDetails, setPinDetails, setShowLabel, setShowModalPin, setImageUploaded)}
                                        type="file" name="upload_img" id="upload_img" value=""
                                    />
                                </label>
                                
                                <div className="modal_pin"
                                    style={{
                                        display: showModalPin ? 'block' : 'none'
                                    }}
                                >
                                    <div className="pin_image">
                                        <img onLoad={check_size} src={pinDetails.img_blob} alt="pin_image"/>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="side" id="right_side">
                            <div className="section1">
                                <div className="select_size">
                                    <select defaultValue="Select size" value={pinDetails.pin_size} name="pin_size" id="pin_size" onChange={(e) => setPinDetails({ ...pinDetails, pin_size: e.target.value })}>
                                        <option value="">Select size</option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>
                            </div>
                            <div className="section2">
                                <input placeholder="Add a title" type="text" className="new_pin_input" id="pin_title" value={pinDetails.title} onChange={(e) => setPinDetails({ ...pinDetails, title: e.target.value })}/>
                                <textarea placeholder="What is this pin about?" type="text" className="new_pin_input" id="pin_description" value={pinDetails.description} onChange={(e) => setPinDetails({ ...pinDetails, description: e.target.value })}/>
                                <div className="update_pin" onClick={() => update_pin(pinDetails, props.change_pin)}>Update</div>
                            </div>
                        </div>
                    </div>
                }
            </div>
            }

            <ReactTooltip
                id="my-tooltip-1"
                place="bottom"
                content="Remove Image"
            />    
            <ToastContainer style={{ zIndex: "100000" }} position="top-center" autoClose={2000} pauseOnHover={false} />
        </div>
    )
}

export default Modal;