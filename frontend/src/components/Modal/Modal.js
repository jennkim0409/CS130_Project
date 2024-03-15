import React, { useState, useEffect } from 'react';
import './Modal.css';
import remove from '../../assets/remove.png';
import upload from '../../assets/cloud-computing.png';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import { ChromePicker } from 'react-color';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Namespace for Modal related functions.
 * @namespace Modal
 */

/**
 * Resizes an image file.
 * @memberof Modal
 * @function resizeImage
 * @param {File} file - The image file to resize.
 * @param {Function} callback - The callback function to handle the resized image.
 */
function resizeImage(file, callback) {
    // limit max size of image
    const maxWidth = 800;
    const maxHeight = 800;
    const reader = new FileReader();
    reader.onload = e => {
        const img = document.createElement("img");
        img.onload = () => {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            let width = img.width;
            let height = img.height;

            // adjust canvas dimensions if too big
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            canvas.width = width;
            canvas.height = height;

            // resized image bg transparent
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);
            // webp compresses better than png and jpeg, while maintaining quality
            canvas.toBlob(callback, 'image/webp', 0.5);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Uploads an image.
 * @memberof Modal
 * @function upload_img
 * @param {Event} event - The event triggering the upload.
 * @param {object} pinDetails - Details of the pin.
 * @param {Function} setPinDetails - Setter function for pinDetails.
 * @param {Function} setShowLabel - Setter function for showLabel.
 * @param {Function} setShowModalPin - Setter function for showModalPin.
 * @param {Function} setImageUploaded - Setter function for imageUploaded.
 */
function upload_img(event, pinDetails, setPinDetails, setShowLabel, setShowModalPin, setImageUploaded) {
    if (event.target.files && event.target.files[0]) {
        if (/image\/*/.test(event.target.files[0].type)) {
            resizeImage(event.target.files[0], (resizedImage) => {
                const reader = new FileReader();

                // once the file is read, we set Pin Details
                // use old pinDetails info if already present and set img_blob to image
                reader.onload = function(e) {
                    setPinDetails({
                        ...pinDetails,
                        img_blob: e.target.result
                    });
                    setShowLabel(false);
                    setShowModalPin(true);
                    setImageUploaded(true);
                };
                reader.readAsDataURL(resizedImage);
            });
        }
    }
}

/**
 * Removes an image.
 * @memberof Modal
 * @function remove_image
 * @param {object} pinDetails - Details of the pin.
 * @param {Function} setPinDetails - Setter function for pinDetails.
 * @param {Function} setShowLabel - Setter function for showLabel.
 * @param {Function} setShowModalPin - Setter function for showModalPin.
 * @param {Function} setImageUploaded - Setter function for imageUploaded.
 */
function remove_image(pinDetails, setPinDetails, setShowLabel, setShowModalPin, setImageUploaded) {
    setPinDetails({
        ...pinDetails,
        img_blob: null
    });
    setShowLabel(true);
    setShowModalPin(false);
    setImageUploaded(false); 
}

/**
 * Checks the size of an image.
 * @memberof Modal
 * @function check_size
 * @param {Event} event - The event triggering the size check.
 */
function check_size(event) {
    const image = event.target;
    image.classList.add('pin_max_width');
    if (
        image.getBoundingClientRect().width < image.parentElement.getBoundingClientRect().width ||
        image.getBoundingClientRect().height < image.parentElement.getBoundingClientRect().height
    ) {
        image.classList.remove('pin_max_width');
        image.classList.add('pin_max_height');
    }

    image.style.opacity = 1;
}

/**
 * Saves pin details.
 * @memberof Modal
 * @function save_pin
 * @param {object} pinDetails - Details of the pin.
 * @param {Function} add_pin - Function to add a pin.
 */
function save_pin(pinDetails, add_pin) {
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

/**
 * Saves pin details with text.
 * @memberof Modal
 * @function save_pin_text
 * @param {object} pinDetails - Details of the pin.
 * @param {Function} add_pin - Function to add a pin.
 * @param {string} textColor - Color of the text.
 */
function save_pin_text(pinDetails, add_pin, textColor) {
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

/**
 * Updates pin details.
 * @memberof Modal
 * @function update_pin
 * @param {object} pinDetails - Details of the pin.
 * @param {Function} change_pin - Function to change a pin.
 */
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

/**
 * Updates pin details with text.
 * @memberof Modal
 * @function update_pin_text
 * @param {object} pinDetails - Details of the pin.
 * @param {Function} change_pin - Function to change a pin.
 */
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

/**
 * React component for a modal.
 * @memberof Modal
 * @function Modal
 * @param {object} props - Component props.
 * @returns {JSX.Element} A React JSX Element representing the modal component.
 */
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
    const [imageUploaded, setImageUploaded] = useState(false);
    const [toggleText, setToggleText] = useState(false);
    const [textColor, setTextColor] = useState('#000');

    useEffect(() => {
        if (props.editPinDetails !== null) {
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
                        <div className="submit" onClick={() => save_pin_text(pinDetails, props.add_pin, textColor)}>Save</div>
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
                                        data-testid="upload_img" type="file" name="upload_img" id="upload_img" value="" 
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
                                <div onClick={() => save_pin(pinDetails, props.add_pin)} className="save_pin">Save</div>
                            </div>
                        </div>
                    </div>
                }
            </div>
            :
            <div className="add_pin_container">
                { toggleText?
                    <div className="add_pin_details_text">
                        <input placeholder="Add a title" type="text" className="new_pin_input" id="pin_title" value={pinDetails.title} onChange={(e) => setPinDetails({ ...pinDetails, title: e.target.value })}/>
                        <textarea placeholder="Enter your Quote or Text" type="text" className="new_pin_input" id="pin_quote" value={pinDetails.quote} onChange={(e) => setPinDetails({ ...pinDetails, quote: e.target.value })}/>
                        <ChromePicker
                            color={pinDetails.text_color}
                            onChangeComplete={(color) => setPinDetails({ ...pinDetails, text_color: color.hex })}
                        />
                        {props.owner ?
                            <div className="submit" onClick={() => update_pin_text(pinDetails, props.change_pin)}>Update</div>
                            :
                            null
                        }
                    </div>
                    :
                    <div className="add_pin_details_image">
                        <div className="side" id="left_side">
                            <div className="section1">
                                { imageUploaded && props.owner ? 
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
                                { props.owner ?
                                    <div className="update_pin" onClick={() => update_pin(pinDetails, props.change_pin)}>Update</div>
                                    : null
                                }   
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
