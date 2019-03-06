import React from 'react';
import './RoomSearch.css';

const RoomSearch = ({ findJoinableRooms, searchResults, joinRoom }) => {

  // const { findJoinableRooms, searchResults } = this.props;
  const test = (e) => {
    console.log(e.target.value);
    findJoinableRooms();
  }

  return (
    <div className="room-search">
      <input
        type="search"
        name="search"
        placeholder="Find a room..."
        onChange={findJoinableRooms}
      />
      <ul className="results">
        {searchResults ? searchResults.map((room) => <li key={room.id} onClickCapture={joinRoom}>{room.name}</li>)
        : null }
      </ul>
    </div>
  );
};

export default RoomSearch;
