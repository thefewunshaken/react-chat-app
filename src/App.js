import React, { Component } from 'react';
import './App.css';
import RoomList from './components/RoomList/RoomList';
import MessageList from './components/MessageList/MessageList';
import SendMessageForm from './components/SendMessageForm';

class App extends Component {
  render() {
    return (
      <div className="App">
        <RoomList />
        <MessageList />
        <SendMessageForm />
      </div>
    );
  }
}

export default App;
