import './ModalAndPin.css';
import React from 'react';
import Modal from '../Modal/Modal';
import Pin from '../Pin/Pin';
import add from '../../assets/add.svg';

class ModalAndPin extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            pins: [],
            show_modal: false
        };
    }

    add_pin = pinDetails => {
        this.setState(_state => {
            const new_pins = [
                ..._state.pins
            ]

            // key is an ordering attribute of this pin
            // we use the length of the state pins since this keeps increasing with every new pin
            new_pins.push(
                <Pin pinDetails={pinDetails} key={pinDetails.ordering_id} pinId={pinDetails.ordering_id} removePin={this.remove_pin}/>
            )
            console.log(new_pins);
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