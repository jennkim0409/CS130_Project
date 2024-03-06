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
            boardId: props.boardId, // refer to using this.state.boardId
            editPinDetails: null,
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

            // populate pins from DB
            const new_pins = [];

            // key is an ordering attribute of this pin
            // we use the length of the state pins since this keeps increasing with every new pin
            pins.forEach((pinDetails) => {
                new_pins.push(
                    <Pin pinDetails={pinDetails} key={pinDetails.ordering_id} pinId={pinDetails.ordering_id} removePin={this.remove_pin} editPin={this.editPin}/>
                )
            });

            this.setState({
                pins: new_pins
            });
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
                <Pin pinDetails={pinDetails} key={pinDetails.ordering_id} pinId={pinDetails.ordering_id} removePin={this.remove_pin} editPin={this.editPin}/>
            )
            
            // insert new pin in backend
            pinDetails.boardId = this.state.boardId; 

            // TO DO: the actual imb_blob makes the payload too large for the HTTP library to handle
            // we need to do some additional processing, such as compressing the image
            // (below is hardcoded image link for now)          
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

            // @jenn read here

            // if I add this, then the pin will show properly upon being added
            // but not sure if this affects other things...

            // this.setState({
            //     pins: new_pins
            // });

            // I think I broke something relating to this functionality
            // when I add a pin, it no longer appears unless I refresh page and it's fetched from backend
            // I think it's no longer storing them in state
            // which is affecting how ordering_id is incremented
            return {
                pins: new_pins,
                show_modal: false,
                editPinDetails: null,
            }
        })
    }

    // function to account for updating a pin
    change_pin = pinDetails => {
        this.setState(_state => {
            // map through the existing pins to find the one to update
            const updated = _state.pins.map(pinElement => {
                if (pinElement.props.pinId === pinDetails.ordering_id) {
                    // return new pin with updated details
                    return <Pin pinDetails={pinDetails} key={pinDetails.ordering_id} pinId={pinDetails.ordering_id} removePin={this.remove_pin} editPin={this.editPin}/>;
                } else {
                    return pinElement;
                }
            });

            return {
                ..._state,
                pins: updated,
                show_modal: false, 
                editPinDetails: null,
            };
        });
    }

    remove_pin = async (orderingId) => {
        // @ kaylee TO DO:
        // when ordering_id incrementing thing is fixed, this code below can be uncommented
        // const pinRemoveData = this.state.pins.filter(pinElement => pinElement.props.pinDetails.ordering_id === orderingId);
        const pinRemoveData = this.state.pins[0];
        const pinToRemove = pinRemoveData.props.pinDetails;
        console.log("pin to remove: ");
        console.log(pinToRemove);

        this.setState(prevState => ({
            pins: prevState.pins.filter(pinElement => pinElement.props.pinDetails.ordering_id !== orderingId)
        }));

        // remove pin in backend
        try {
            const response = await axios.post('http://localhost:5555/api/board/removeItem/', 
            {boardId: this.state.boardId, itemId: pinToRemove.id}, 
            {
                headers: { Authorization: localStorage.getItem("user_token") }
            });
            console.log(response.data);
        } 
        catch (error) {
            console.error("Error removing pin: ", error);
        }
    }

    // function used when pin is clicked
    // we know that we want to edit/view this pin, so update to show modal and also set in editing view
    editPin = (pinDetails) => {
        // Set state with pinDetails to edit and make modal visible
        this.setState({
            editPinDetails: pinDetails,
            show_modal: true,
        });
    };

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
                    event => event.target.className === "add_pin_modal" ? this.setState({show_modal: false, editPinDetails: null}) : null
                    }
                    className="add_pin_modal_container"
                >
                    {
                        this.state.show_modal ? 
                        <Modal add_pin={this.add_pin} editPinDetails={this.state.editPinDetails} change_pin={this.change_pin}/> : null
                    }
                </div>
            </div>
        )
    }
}
export default ModalAndPin;