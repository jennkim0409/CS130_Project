import './ModalAndPin.css';
import React from 'react';
import Modal from '../Modal/Modal';
import Pin from '../Pin/Pin';
import add from '../../assets/add.svg';
import axios from 'axios';
import expiredToken from '../ExpiredToken';

class ModalAndPin extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            pins: [],
            show_modal: false,
            boardId: props.boardId, // refer to using this.state.boardId
            editPinDetails: null,
            lastId: 0,
        };
    }

    async componentDidMount() {
        try {
            const response = await axios.get('http://localhost:5555/api/board/getBoard/', {
                params: { boardId: this.state.boardId },
                headers: { Authorization: localStorage.getItem("user_token") }
            });
            const pins = response.data.items;
            console.log("pins from api: ");
            console.log(pins);

            // if pins are stored in database, then retrieve the last one in array
            // we need to make sure that we increment unique id from this number onwards
            if (pins.length > 0) {
                const id_with_string = pins.slice(-1)[0].ordering_id;
                this.setState({
                    lastId: parseInt(id_with_string.split("pin-")[1], 10)
                });
            }
            else {
                this.setState({
                    lastId: 0
                });
            }
            
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

    add_pin = async (pinDetails) => {
        // compute next id
        const nextId = this.state.lastId + 1;
        pinDetails.ordering_id = `pin-${nextId}`;
        pinDetails.boardId = this.state.boardId;
    
        try {
            // insert new pin in the backend
            const response = await axios.post('http://localhost:5555/api/board/addItem/', {...pinDetails}, {
                headers: { Authorization: localStorage.getItem("user_token") }
            });
        
            // update pinDetails id to reflect DB id
            pinDetails.id = (response.data.board.items[response.data.board.items.length - 1]).id;
    
            // update state with new pin and the lastId
            this.setState(prevState => ({
                lastId: nextId, // Update lastId here instead of a separate setState call
                pins: [...prevState.pins, <Pin pinDetails={pinDetails} key={pinDetails.ordering_id} pinId={pinDetails.ordering_id} removePin={this.remove_pin} editPin={this.editPin}/>],
                show_modal: false,
                editPinDetails: null,
            }));
        } catch (error) {
            console.error("Error adding pin: ", error);
            if (error.response.data.message === "Unauthorized- Invalid Token" || 
                error.response.data.message === "Unauthorized- Missing token") {
                expiredToken();
            }
        }
    }

    // function to account for updating a pin
    change_pin = async pinDetails => {
        // update backend
        pinDetails.itemId = pinDetails.id;

        try {
            const response = await axios.post('http://localhost:5555/api/board/updateItem/', {...pinDetails}, 
            {
                headers: { Authorization: localStorage.getItem("user_token") }
            });
            console.log(response.data);
        } 
        catch (error) {
            console.error("Error updating pin: ", error);
            if (error.response.data.message === "Unauthorized- Invalid Token" || 
                error.response.data.message === "Unauthorized- Missing token") {
                expiredToken();
            }
        }
        
        // update frontend
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
        const pinRemoveData = this.state.pins.filter(pinElement => pinElement.props.pinDetails.ordering_id === orderingId);
        const pinToRemove = pinRemoveData.length > 0 ? pinRemoveData[0].props.pinDetails : null;

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
            if (error.response.data.message === "Unauthorized- Invalid Token" || 
                error.response.data.message === "Unauthorized- Missing token") {
                expiredToken();
            }
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