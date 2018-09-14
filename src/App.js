// ==> Notes for improvement
//  ✔ differentiate between fetched messages and sent messages
//  ✔ scroll chat to bottom if sending a message or if scrollbar
//    is already at the bottom
//  ✖ Remember scroll location in the previous room
//  ✖ Begin scrollbar at the bottom
//  ✖ visual notification for a new fetchedMessage in a room
//  ✖ look into cookies, saving login info locally to user's computer
// ==> Tasks
// ✖ finish front-end functionality for chatting
//    • indicate current Room
//    • change Rooms
//    • create Room
//    • add/remove users to a Room
// ✖ block chat behind a login wall
// ✖ create login system

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
      userRooms: [],
      currentUser: '',
      currentRoom: '',
      mostRecentMessage: {},
      isNewRoomModalVisible: false
    }
    this.handleFormKeySubmit = this.handleFormKeySubmit.bind(this); //allow access to this.state
    this.changeActiveRoom = this.changeActiveRoom.bind(this); //allow access to this.state
    this.addMessages = this.addMessages.bind(this); //allow access to this.state
    this.createNewRoom = this.createNewRoom.bind(this); //allow access to this.state
    this.updateRoomSubs = this.updateRoomSubs.bind(this); //allow access to this.state
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
          this.setState({currentUser: currentUser});
          this.setState({userRooms: currentUser.rooms});
          this.setState({currentRoom: currentUser.rooms[0]});
          this.updateRoomSubs();
        }) // end of .then()
        .catch(error => {
          console.error(`Error: ${error}`);
        });
  }

  updateRoomSubs() {
    // subscribe to all rooms joined by currentUser
    this.state.currentUser.rooms.map(room => {
      this.state.currentUser.subscribeToRoom({
        roomId: room.id, //might be an issue later with only seeing messages from a given room
        hooks: {
          // callback that triggers when a new message is added to the room
          onNewMessage: message => {
            // console.log(message);
            this.setState({mostRecentMessage: message});
            this.handleMsgListScroll();
            this.addMessages(room, message);
            console.log(`currentRoom: ${this.state.currentRoom.name}`);
            console.log('userRooms: ', this.state.userRooms);
          } // end of onNewMessage callback
        } // end of hooks
      }); // end of currentUser.subscribeToRoom
    }) // end of currentUser.rooms.map
  }

  sendMessage(e) {
    if(e.target.value) { //if message is not blank
      console.log(`${this.state.currentUser.name} sent a message`);
      this.state.currentUser.sendMessage({
        text: e.target.value,
        roomId: this.state.currentRoom.id
      })
      .catch(err => {
        console.log(`Error sending message to ${this.state.currentRoom.name}`) //name might not be right property for currentRoom
      });

      e.target.value=''; //empty textarea after message is sent      
    }
  }

  hasElementScrolledToBottom(element) {
    if(element.scrollHeight - element.scrollTop === element.clientHeight) {
      return true;
    }
    return false;
  }
    
  handleMsgListScroll() {
    const msgList = document.querySelector('.MessageList');

    // Helper function.
    const animateScroll = (duration) => {
      let start = msgList.scrollTop;
      let end = msgList.scrollHeight;
      let change = end - start;
      let increment = 20;

      const easeInOut = (currentTime, start, change, duration) => {
        // by Robert Penner
        currentTime /= duration / 2;
        if (currentTime < 1) {
          return change / 2 * currentTime * currentTime + start;
        }
        currentTime -= 1;
        return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
      }
      function animate(elapsedTime) {
        elapsedTime += increment;
        var position = easeInOut(elapsedTime, start, change, duration);
        msgList.scrollTop = position;
        if (elapsedTime < duration) {
          setTimeout(function() {
            animate(elapsedTime);
          }, increment)
        }
      }
      animate(0);
    }

    const scrollToBottom = () => {  
      let duration = 300; // how many milliseconds to scroll
      animateScroll(duration, msgList);
    }

    // scrollToBottom if the message is being sent by currentUser
    // or if the scrollbar is already at the bottom
    if( (this.state.mostRecentMessage.senderId === this.state.currentUser.name) ||
      (this.hasElementScrolledToBottom(msgList)) ) {
        scrollToBottom();
    }
    // was trying to get too fancy and overcomplicate what was a simple solution
    // const observer = new MutationObserver(scrollToBottom);
    // const config = {childList: true};
    // observer.observe(msgList, config);
  }

  addMessages(room, message) {
    // state of messages should only be for currentRoom
    if(room.id === this.state.currentRoom.id) {
      this.setState({
        messages: [...this.state.messages, message]
      });
    }
  }

  handleFormKeySubmit(e) {
    if(e.which === 13) { //on press ENTER
      e.preventDefault(); //prevent newline
      if(e.target.value.startsWith('\\')) {
        // do this
        const stringArr = e.target.value.replace('\\', '').split(' ');
        const command = stringArr[0]; //portion of string before period
        const user = stringArr[1]; //portion of string after period
        // is command add or remove? if so add/remove user, if not do nothing
        // command === 'add' ? this.addUser(user) : command === 'remove' ? this.removeUser(user) : null;
        switch(command) {
          case 'add':
          this.addUser(user)
          break;
          case 'remove':
          this.removeUser(user)
          break;
          case 'delete':
          this.deleteRoom()
          break;
          default:
          null;
        }
        e.target.value=''; //empty message
      } else {
        this.sendMessage(e);
      }
    }
    // if(e.target.style.height !== '100%') {
    //   console.log('Message Box height: ', window.getComputedStyle(e.target).getPropertyValue('height'));
    //   console.log(e.target.getAttribute('rows'));
    // }
  }

  handleErrs(err) {
    console.log('Error:', err.statusCode, err.error_description, err.error_url)
  }

  addUser(user) {
    this.state.currentUser.addUserToRoom({
      userId: user,
      roomId: this.state.currentRoom.id
    })
      .then(() => {
        const confirmation = `Added ${user} to ${this.state.currentRoom.name}`;
        this.state.currentUser.sendMessage({
          text: confirmation,
          roomId: this.state.currentRoom.id
        })
        .catch(err => console.log(`Error sending message: ${err}`))
        // this.setState({messages: [...this.state.messages, confirmation]});
      })
      .catch(err => console.log(`Error: ${err}`));
  }

  removeUser(user) {
    this.state.currentUser.removeUserFromRoom({
      userId: user,
      roomId: this.state.currentRoom.id
    })
      .then(() => {
        const confirmation = `Removed ${user} from ${this.state.currentRoom.name}`;
        this.state.currentUser.sendMessage({
          text: confirmation,
          roomId: this.state.currentRoom.id
        })
        .catch(err => console.log(`Error sending message: ${err}`))
      })
      .catch(err => console.log(`Error: ${err}`));
  }

  changeActiveRoom(e) {
    this.setState({userRooms: this.state.currentUser.rooms});
    const roomTarget = e.currentTarget.textContent.replace('# ', ''); // room to switch to
    this.state.userRooms.forEach(room => {
      if(room.name.toLowerCase() === roomTarget) {
        console.log(`userRooms.room: ${room.name.toLowerCase()}`);
        console.log(`roomTarget: ${roomTarget}`);
        this.setState({currentRoom: room}) // REMINDER: setting state is asynchronous
        this.state.currentUser.fetchMessages({ //change visible messages to currentRoom messages
          roomId: room.id // changing value as room instead of currentRoom b/c setting state is asynchronous
        })
          .then(messages => {
            this.setState({messages: messages});
          })
          .catch(err => this.handleErrs(err));
      }
    });
  }

  createNewRoom(roomName, isPrivate) {
    this.state.currentUser.createRoom({
      name: roomName,
      private: isPrivate,
    })
      .then(room => {
        this.setState({userRooms: [...this.state.userRooms, room]});
        console.log(`Created new room ${room.name}`);
        this.setState({currentRoom: room});
        this.state.currentUser.fetchMessages({
          roomId: room.id
        })
          .then(messages => {
            this.setState({messages: messages});
          })
        this.updateRoomSubs();
      })
    .catch(err => console.log(`Error creating room: ${err}`));
    // switching to new room room and sending a message after creation
    // causes the new messages to not show up
  }

  deleteRoom() {
    this.state.currentUser.deleteRoom({ roomId: this.state.currentRoom.id})
      .then(() => {
        console.log(`Deleted room ${this.state.currentRoom.name}`);
        this.setState({currentRoom: this.state.currentUser.rooms[0]})
      })
      .catch(err => this.handleErrs(err));
  }
  
  render() {
    return (
      <div className="App">
        <RoomList
          userRooms={this.state.userRooms}
          changeActiveRoom={this.changeActiveRoom}
          currentRoom={this.state.currentRoom}
          createNewRoom={this.createNewRoom}
        />
        <MessageList
          messages={this.state.messages}
          currentUser={this.state.currentUser}
        />
        <SendMessageForm handleFormKeySubmit={this.handleFormKeySubmit}/>
      </div>
    );
  }
}

export default App;
