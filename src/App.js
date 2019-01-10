// ==> Notes for improvement
//  ✔ differentiate between fetched messages and sent messages
//  ✔ scroll chat to bottom if sending a message or if scrollbar
//    is already at the bottom
//  ✖ Remember scroll location in the previous room
//  ✖ Begin scrollbar at the bottom
//  ✖ visual notification for a new fetchedMessage in a room
//  ✖ look into cookies, saving login info locally to user's computer
// ==> Tasks
// ✔ finish front-end functionality for chatting
//    • indicate current Room
//    • change Rooms
//    • create Room
//    • add/remove users to a Room
// ✖ block chat behind a login wall
// ✖ create login system

import React, { Component } from 'react';
import { ChatManager } from '@pusher/chatkit-client';
import { tokenProvider } from './config';
import './App.css';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import RoomList from './components/RoomList/RoomList';
import MessageList from './components/MessageList/MessageList';
import SendMessageForm from './components/SendMessageForm/SendMessageForm';

class App extends Component {
  constructor() {
    super();
    this.state = {
      // route: 'register',
      route: 'chat',
      messages: [],
      userRooms: [],
      currentUser: '',
      currentRoom: '',
      mostRecentMessage: {},
      isNewRoomModalVisible: false,
      isSignedIn: false,
    };
    // allow access to this
    this.handleFormKeySubmit = this.handleFormKeySubmit.bind(this);
    this.changeActiveRoom = this.changeActiveRoom.bind(this);
    this.addMessages = this.addMessages.bind(this);
    this.createNewRoom = this.createNewRoom.bind(this);
    this.updateRoomSubs = this.updateRoomSubs.bind(this);
  }

  componentDidMount() {
    // connect to chatManager when App mounts
    const chatManager = new ChatManager({
      instanceLocator: 'v1:us1:e715b746-5ea8-4ca9-84d8-3c82b88981d8',
      // TODO: once server side is made, userId will be currentUser fetched from the db via server
      userId: 'jkcoder',
      tokenProvider,
    });

    chatManager
      .connect()
      .then((currentUser) => {
        this.setState({ currentUser });
        this.setState({ userRooms: currentUser.rooms });
        this.setState({ currentRoom: currentUser.rooms[0] });

        const { currentRoom } = this.state;
        // maybe make into a fn initializeActiveRoom & check if user has any rooms
        currentUser.fetchMessages({
          roomId: currentRoom.id,
        })
          .then(messages => this.setState({ messages }))
          .catch(err => console.error(`Error fetching messages: ${err}`));
        this.updateRoomSubs();
        // this.changeActiveRoom();
      })
      .catch((error) => {
        console.error(`Error: ${error}`);
      });
  }

  onRouteChange(route) {
    if (route === 'chat') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route });
  }

  updateRoomSubs() {
    const { currentUser, currentRoom, route, userRooms } = this.state;
    // subscribe to all rooms joined by currentUser
    currentUser.rooms.forEach((room) => {
      currentUser.subscribeToRoom({
        // might be an issue later with only seeing messages from a given room
        roomId: room.id,
        hooks: {
          // callback that triggers when a new message is added to the room
          onMessage: (message) => {
            this.setState({ mostRecentMessage: message });
            if (route === 'chat') {
              this.handleMsgListScroll();
            }
            this.addMessages(room, message);
          } // end of onNewMessage callback
        } // end of hooks
      }); // end of currentUser.subscribeToRoom
    }); // end of currentUser.rooms.map
  }

  sendMessage(e) {
    const { currentUser, currentRoom, mostRecentMessage } = this.state;
    // if message is not blank
    if (e.target.value !== '') {
      console.log(`${currentUser.name} sent a message`);
      this.addMessages(currentRoom, mostRecentMessage);
      currentUser.sendMessage({
        text: e.target.value,
        roomId: currentRoom.id
      })
        .catch(err => {
          console.log(`Error sending message to ${currentRoom.name}`) // name might not be right property for currentRoom
        });
      // empty textarea after message is sent
      e.target.value = '';      
    }
  }

  // originally had "element" as param
  hasElementScrolledToBottom(element) {
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      return true;
    }
    return false;
  }
    
  handleMsgListScroll() {
    const { currentUser, mostRecentMessage } = this.state;
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
        let position = easeInOut(elapsedTime, start, change, duration);
        msgList.scrollTop = position;
        if (elapsedTime < duration) {
          setTimeout(() => {
            animate(elapsedTime);
          }, increment);
        }
      }
      animate(0);
    }

    const scrollToBottom = () => {
      // how many milliseconds to scroll
      const duration = 300;
      animateScroll(duration, msgList);
    }

    // scrollToBottom if the message is being sent by currentUser
    // or if the scrollbar is already at the bottom
    if( (mostRecentMessage.senderId === currentUser.name)
      // (this.hasElementScrolledToBottom(msgList)) ) {
    || (this.hasElementScrolledToBottom(msgList))) {
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
    // on press ENTER
    if (e.which === 13) {
      // prevent newline
      e.preventDefault();
      // allow commands to be run from the SendMessageForm if message starts with \
      if (e.target.value.startsWith('\\')) {
        const stringArr = e.target.value.replace('\\', '').split(' ');
        // portion of string before space
        const command = stringArr[0];
        // portion of string after space
        const stringArg = stringArr[1];
        // command === 'add' ? this.addUser(user) : command === 'remove' ? this.removeUser(user) : null;
        // options for \command
        switch (command) {
          case 'add':
            this.addUser(stringArg);
            break;
          case 'remove':
            this.removeUser(stringArg);
            break;
          case 'delete':
            this.deleteRoom(stringArg);
            break;
          default:
            return;
        }
        // empty message
        e.target.value = '';
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

  addUser(stringArg) {
    this.state.currentUser.addUserToRoom({
      userId: stringArg,
      roomId: this.state.currentRoom.id
    })
      .then(() => {
        const confirmation = `Added ${stringArg} to ${this.state.currentRoom.name}`;
        this.state.currentUser.sendMessage({
          text: confirmation,
          roomId: this.state.currentRoom.id
        })
        .catch(err => console.log(`Error sending message: ${err}`))
        // this.setState({messages: [...this.state.messages, confirmation]});
      })
      .catch(err => console.log(`Error: ${err}`));
  }

  removeUser(stringArg) {
    this.state.currentUser.removeUserFromRoom({
      userId: stringArg,
      roomId: this.state.currentRoom.id
    })
      .then(() => {
        const confirmation = `Removed ${stringArg} from ${this.state.currentRoom.name}`;
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
        // REMINDER: setting state is asynchronous
        this.setState({currentRoom: room});
        //change visible messages to currentRoom messages
        this.state.currentUser.fetchMessages({
          // changing value as room instead of currentRoom b/c setting state is asynchronous
          roomId: room.id
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

  deleteRoom(stringArg) {
    const roomToDelete = this.state.userRooms.find(room => room.name === stringArg);
    this.state.currentUser.deleteRoom({ roomId: roomToDelete.id})
      .then(() => {
        console.log(`Deleted room ${this.state.currentRoom.name}`);
        this.setState({currentRoom: this.state.currentUser.rooms[0]})
      })
      .catch(err => this.handleErrs(err));
  }

  render() {
    const { route, userRooms, currentRoom, messages, currentUser } = this.state;

    if (route === 'chat') {
      return (
        <div className="App">
          <RoomList
            userRooms={userRooms}
            changeActiveRoom={this.changeActiveRoom}
            currentRoom={currentRoom}
            createNewRoom={this.createNewRoom}
          />
          <MessageList
            messages={messages}
            currentUser={currentUser}
          />
          <SendMessageForm handleFormKeySubmit={this.handleFormKeySubmit} />
        </div>
      );
    } else if (route === 'signin') {
        return (
          <div>
            <SignIn onRouteChange={this.onRouteChange} />
          </div>
        );
      } else if (route === 'register') {
        return (
          <div>
            <Register onRouteChange={this.onRouteChange} />
          </div>
          );
      }

  }
}

export default App;
