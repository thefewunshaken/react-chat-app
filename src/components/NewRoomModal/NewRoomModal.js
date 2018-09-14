import React from 'react';
import './NewRoomModal.css';

const NewRoomForm = ({ isModalVisible, handleModalKeyPress }) => {
  return isModalVisible ? (
    <div className='modal' onKeyPressCapture={handleModalKeyPress}>
      <input id="room-name" placeholder='Create Room...'/>
      <div id='private-check'>
        <label>Private:</label>
        <input type="checkbox" name="private" id="private-checkbox"/>
      </div>
    </div>
  ) : null;
}

export default NewRoomForm;