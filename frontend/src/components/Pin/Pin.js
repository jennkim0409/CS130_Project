import React from 'react';
import './Pin.css';
import download from '../../assets/downloads.png';
import remove from '../../assets/remove.png';
import TextSize from '../TextSize/TextSize';

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

function downloadImage(imageSrc) {
    const imageName = prompt("Enter the file name:", "image");
    if (imageName) { // Check if user entered a name
        // Create a temporary anchor (link) element
        const link = document.createElement('a');
        link.href = imageSrc; // Set the href to the image source
        link.download = imageName; // Use the user-provided name for the download
        document.body.appendChild(link); // Append to the document
        link.click(); // Programmatically click to trigger the download
        document.body.removeChild(link); // Clean up after download
    }
}


function Pin(props) {
    const canEdit = props.owner;

    const handleDownloadClick = () => {
        const imageSrc = props.pinDetails.img_blob;
        downloadImage(imageSrc);
    };

    if (props.pinDetails.quote !== '') {
        props.pinDetails.pin_size = 'medium';
    }

    console.log(props.pinDetails)
    return (
        <div className = {`card card_${props.pinDetails.pin_size}`}>
            <div className="pin_title">{props.pinDetails.title}</div>

            <div className="pin_modal" onClick={() => props.editPin(props.pinDetails)}>
                {canEdit ?
                    <div className="modal_head">
                        <div className="pint_mock_icon_container" onClick={(event) => {
                            event.stopPropagation(); // so edit mode doesn't show up when clicking remove
                            if (window.confirm("Are you sure you want to delete this pin?")) {
                                props.removePin(props.pinDetails.ordering_id);
                            }
                        }}>
                            <img src={remove} alt="remove" className="pint_mock_icon_remove" />
                        </div>
                    </div>
                    : null
                }
                <div className="modal_foot">
                    { (props.pinDetails.quote === '') ? 
                        <div className="pint_mock_icon_container" onClick={(event) => {
                            event.stopPropagation();
                            handleDownloadClick();
                        }}>
                            <img src={download} alt="download" className="pint_mock_icon" /> 
                        </div>
                        :
                        null
                    }
                </div>
            </div>
            { (props.pinDetails.quote === '') ?
                <div className="pin_image">
                    <img onLoad={check_size} src={props.pinDetails.img_blob} alt="pin_image"/>
                </div>
                :
                <div className="pin_text">
                    <TextSize quote={props.pinDetails.quote} color={props.pinDetails.text_color}/>
                </div>
            }
        </div>
    )
}
export default Pin;