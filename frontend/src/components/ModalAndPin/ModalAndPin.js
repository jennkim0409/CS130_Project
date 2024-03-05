import './ModalAndPin.css';
import React from 'react';
import Modal from '../Modal/Modal';
import Pin from '../Pin/Pin';
import add from '../../assets/add.svg';
import axios from 'axios';

class ModalAndPin extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            pins: [],
            show_modal: false,
            boardId: props.boardId // refer to using this.state.boardId
        };
    }

    async componentDidMount() {
        console.log("Component initialized");

        try {
            const response = await axios.get('http://localhost:5555/api/board/getBoard/', {
                params: { boardId: this.state.boardId },
                headers: { Authorization: localStorage.getItem("user_token") }
            });
            const pins = response.data.items;
            console.log("pins from api: ");
            console.log(pins);

            // TO DO: wait for diana to populate this with an array of items
            // instead of array of item objects

            // then, assign these to the pins field in this.state.pins
            // hopefully this populates page with pre-existing pins!
        } 
        catch (error) {
            console.error("Error fetching pins data: ", error);
        }
    }

    add_pin = pinDetails => {
        this.setState(async _state => {
            const new_pins = [
                ..._state.pins
            ]

            // key is an ordering attribute of this pin
            // we use the length of the state pins since this keeps increasing with every new pin
            new_pins.push(
                <Pin pinDetails={pinDetails} key={pinDetails.ordering_id} pinId={pinDetails.ordering_id} removePin={this.remove_pin}/>
            )
            
            // insert new pin in backend
            pinDetails.boardId = this.state.boardId; 

            // TO DO: the actual imb_blob makes the payload too large for the HTTP library to handle
            // we need to do some additional processing, such as compressing the image          
            pinDetails.img_blob = "https://m.media-amazon.com/images/W/MEDIAX_849526-T3/images/I/71tQ71QaNML._SY522_.jpg";
            
            try {
                const response = await axios.post('http://localhost:5555/api/board/addItem/', {...pinDetails}, 
                {
                    headers: { Authorization: localStorage.getItem("user_token") }
                });
                console.log(response.data);
                
            } 
            catch (error) {
                console.error("Error adding pin: ", error);
            }

            return {
                pins: new_pins,
                show_modal: false
            }
        })
    }

    remove_pin = (orderingId) => {
        this.setState(prevState => ({
            pins: prevState.pins.filter(pinElement => pinElement.props.pinDetails.ordering_id !== orderingId)
        }));
        // TO DO: update DB when pin is removed
    }

    render() {
        return (
            <div className="modal_and_pin">
                <div className="navigation_bar">
                    <div onClick={() => this.setState({show_modal: true})} className="pint_mock_icon_container add_pin">
                        <img src={add} alt="add_pin" className="pint_mock_icon" /> 
                    </div> 
                </div>

                <div className="pin_container">
                    {this.state.pins}
                </div>

                <div onClick={
                    event => event.target.className === "add_pin_modal" ? this.setState({show_modal: false}) : null
                    }
                    className="add_pin_modal_container"
                >
                    {
                        this.state.show_modal ? 
                        <Modal add_pin={this.add_pin}/> : null
                    }
                </div>
            </div>
        )
    }
}
export default ModalAndPin;