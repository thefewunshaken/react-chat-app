import React, { Component } from 'react';
import Room from '../Room/Room';
import './RoomList.css';
import NewRoomModal from '../NewRoomModal/NewRoomModal';

// need to figure out the new room form
// show new room form on click of + button

class RoomList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalVisible: false,
    }
    this.renderNewRoomModal = this.renderNewRoomModal.bind(this); //allow access to this.state
    this.handleModalKeyPress = this.handleModalKeyPress.bind(this); //allow access to this.state
  }  
    
  handleModalKeyPress(e) {
    const roomName = document.querySelector('#room-name');
    const plusSign = document.querySelector('#plus-sign');
    // bug: doesn't submit roomName if click whitespace in modal before pressing ENTER
    if(e.which === 13 && roomName.value) { // room name can't be blank
      console.log(roomName);
      const isPrivate = document.querySelector('#private-checkbox').checked;
      this.props.createNewRoom(roomName.value, isPrivate);
      roomName.value='';
      plusSign.textContent= '+';
      this.setState({isModalVisible: false});

    } // else indicate that the room name can't be blank
    // add a character limit for room names
  }

  renderNewRoomModal(e) {
    const { isModalVisible } = this.state;
    // fixed a bug where pressing enter messed with textContent
    // of the add-channel button
    if(e.target === document.querySelector('#add-channel')) {
      return;
    }
    if (isModalVisible) {
      e.target.textContent = '+';
      this.setState({isModalVisible: false});
    } else {
      e.target.textContent = '-';
      this.setState({isModalVisible: true});
    }
  }

  render() {
    const { userRooms, changeActiveRoom, currentRoom } = this.props;
    return(
      <div className='RoomList'>
        <h2>Channels</h2>
        <Room userRooms={userRooms} changeRoom={changeActiveRoom} currentRoom={currentRoom}/>
        <button id='add-channel' onClickCapture={this.renderNewRoomModal}>
          <p id='plus-sign'>+</p>
        </button>
        <NewRoomModal
          isModalVisible={this.state.isModalVisible}
          exitNewRoomModal={this.exitNewRoomModal}
          handleModalKeyPress={this.handleModalKeyPress}
        />
      </div>
    );
  }
}

export default RoomList;