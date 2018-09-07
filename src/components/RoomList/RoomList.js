import React, { Component } from 'react';
import './RoomList.css';

const RoomList = () => {
  return(
    <div className='RoomList'>
      <h2>Channels</h2>
      <button>#channel</button>
      <button>#channel</button>
      <button id='add-channel'>
        <p>+</p>
      </button>
    </div>
  );
}

export default RoomList;