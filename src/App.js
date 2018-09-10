// Notes for improvement
// differentiate between fetchedMessages and sendMessages


import React, { Component } from 'react';
import Chatkit from '@pusher/chatkit';
import { secretKey, tokenProvider} from './config';
import './App.css';
import RoomList from './components/RoomList/RoomList';
import MessageList from './components/MessageList/MessageList';
import SendMessageForm from './components/SendMessageForm/SendMessageForm';


class App extends Component {

  constructor() {
    super()
    this.state= {
      messages: [],
      rooms: [],
      currentUser: '',
      currentRoom: '' //not set anywhere yet
    }
    this.handleFormKeySubmit = this.handleFormKeySubmit.bind(this); //allow access to this.state
  }

  componentDidMount() {
    const chatManager = new Chatkit.ChatManager({
      instanceLocator: "v1:us1:e715b746-5ea8-4ca9-84d8-3c82b88981d8",
      userId: "jkcoder",
      tokenProvider: tokenProvider
    });

    chatManager
      .connect()
        .then(currentUser => {
          currentUser.subscribeToRoom({
            roomId: currentUser.rooms[0].id,
            hooks: {
              onNewMessage: message => {
                console.log(message);
                this.setState({
                  messages: [...this.state.messages, message]
                });
              }
            }
          });
          this.setState({currentUser: currentUser});
          // this.setState({currentUser: currentRoom});
        })
        .catch(error => {
          console.error(`Error: ${error}`);
        });

  }

  sendMessage(e) {
    if(e.target.value) {
      console.log('Sent message');
      this.state.currentUser.sendMessage({
        text: e.target.value,
        roomId: this.state.currentUser.rooms[0].id
      });

      e.target.value='';
    }
  }

  handleFormKeySubmit(e) {
    if(e.which === 13) {
      e.preventDefault(); //disable newline on pressing ENTER
    }

    this.sendMessage(e);

    if(e.target.style.height != '100%') {
      // console.log('Message Box height: ', window.getComputedStyle(e.target).getPropertyValue('height'));
      console.log(e.target.getAttribute('rows'));
    }
  }
  
  render() {
    return (
      <div className="App">
        <RoomList rooms={this.state.rooms}/>
        <MessageList messages={this.state.messages}/>
        <SendMessageForm handleFormKeySubmit={this.handleFormKeySubmit}/>
      </div>
    );
  }
}

export default App;
