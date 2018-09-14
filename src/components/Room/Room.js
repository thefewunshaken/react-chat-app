import React from 'react';
// NOTES:
// ✖ get rid of color change on hover for selected room
// ✖ add Icon if room.isPrivate = true
const Room = ({ userRooms, changeRoom, currentRoom }) => {
  return userRooms.length ? (
    <div className='rooms'>
      {userRooms.map((room, index) => {
        if(room.name === currentRoom.name) {
          return (
            <div key={'selected'} className='active-room'>
              <div key={'indicator'} id='indicator'></div>
              <button key={index} className='room' id='selected' onClickCapture={changeRoom}># {room.name.toLowerCase()}</button>
            </div>
          );
        } else {
          return (<button key={index} className='room' onClickCapture={changeRoom}># {room.name.toLowerCase()}</button>);
        }
  
      })}
    </div>
  ) : null;
}

export default Room;