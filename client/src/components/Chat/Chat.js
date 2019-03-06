/**
 * TODO: Add a search rooms modal that prints a list
 * of all joinable rooms (not private)
 * Click to join a room from the list
 */

import React, { Component } from 'react';
import './Chat.css';
import { ChatManager } from '@pusher/chatkit-client';
import { tokenProvider } from '../../config';
import RoomList from '../RoomList/RoomList';
import MessageList from '../MessageList/MessageList';
import SendMessageForm from '../SendMessageForm/SendMessageForm';

export default class Chat extends Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      userRooms: [],
      currentUser: '',
      currentRoom: '',
      mostRecentMessage: {},
      searchResults: '',
      // isNewRoomModalVisible: false,
    };

    this.findJoinableRooms = this.findJoinableRooms.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.loadChatkitUser = this.loadChatkitUser.bind(this);
    this.handleFormKeySubmit = this.handleFormKeySubmit.bind(this);
    this.changeActiveRoom = this.changeActiveRoom.bind(this);
    this.addMessages = this.addMessages.bind(this);
    this.createNewRoom = this.createNewRoom.bind(this);
    this.updateRoomSubscriptions = this.updateRoomSubscriptions.bind(this);
  }

  componentDidMount() {
    this.loadChatkitUser();
  }

  loadChatkitUser() {
    const { userId, isSignedIn } = this.props;
    console.log(userId, isSignedIn);
    // connect to chatManager when signed in
    if (isSignedIn) {
      console.log('Loading chat manager');
      const chatManager = new ChatManager({
        instanceLocator: 'v1:us1:e715b746-5ea8-4ca9-84d8-3c82b88981d8',
        // TODO: once server side is made, userId will be currentUser fetched from the db via server
        // userId: 'jkcoder',
        userId,
        tokenProvider,
      });

      chatManager
        .connect()
        .then((currentUser) => {
          console.log(currentUser);
          this.setState({ currentUser });
          this.setState({ userRooms: currentUser.rooms });
          if (!currentUser.rooms.length) {
            console.log('You have not joined any rooms.');
            /**
             * TO DO: add functionality
             * if user has joined no rooms
             */
          } else {
            this.setState({ currentRoom: currentUser.rooms[0] });
            // maybe make into a fn initializeActiveRoom & check if user has any rooms
            currentUser.fetchMessages({
              roomId: currentUser.rooms[0].id,
            })
              .then(messages => this.setState({ messages }))
              .catch(err => console.error(`Error fetching messages: ${err}`));
            this.updateRoomSubscriptions();
          }
          // this.changeActiveRoom();
        })
        .catch((error) => {
          console.error(`Error: ${error}`);
        });
    }
  }

  updateRoomSubscriptions() {
    const { currentUser, currentRoom, userRooms } = this.state;
    this.setState({ userRooms: currentUser.rooms });
    // subscribe to all rooms joined by currentUser
    userRooms.forEach((room) => {
    // currentUser.rooms.forEach((room) => {
      currentUser.subscribeToRoom({
        // might be an issue later with only seeing messages from a given room
        roomId: room.id,
        hooks: {
          // callback that triggers when a new message is added to the room
          onMessage: (message) => {
            this.setState({ mostRecentMessage: message });
            this.handleMsgListScroll();
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
      // this.addMessages(currentRoom, mostRecentMessage);
      currentUser.sendMessage({
        text: e.target.value,
        roomId: currentRoom.id
      })
        .catch((err) => {
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
        const { currentRoom, currentUser } = this.state;
        const defaultMessage = 'Unrecognized command. Use \\add, \\remove, or \\delete';
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
            currentUser.sendMessage({
              text: defaultMessage,
              roomId: currentRoom.id,
            });
            // need to empty message form after message is sent
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
    const { currentUser, userRooms } = this.state;
    this.setState({ userRooms: currentUser.rooms });
    const roomTarget = e.currentTarget.textContent.replace('# ', ''); // room to switch to
    userRooms.forEach((room) => {
      if(room.name.toLowerCase() === roomTarget) {
        console.log(`userRooms.room: ${room.name.toLowerCase()}`);
        console.log(`roomTarget: ${roomTarget}`);
        // REMINDER: setting state is asynchronous
        this.setState({ currentRoom: room });
        // change visible messages to currentRoom messages
        currentUser.fetchMessages({
          // changing value as room instead of currentRoom b/c setting state is asynchronous
          roomId: room.id,
        })
          .then((messages) => {
            this.setState({ messages });
          })
          .catch(err => this.handleErrs(err));
      }
    });
  }

  getUpdatedUserRooms(room) {
    const { currentUser, userRooms } = this.state;
    this.setState({ userRooms: [...userRooms, room] });
    this.setState({ currentRoom: room });
    currentUser.fetchMessages({
      roomId: room.id,
    })
      .then((messages) => {
        this.setState({ messages });
      });
    this.updateRoomSubscriptions();
  }

  findJoinableRooms(e) {
    const { currentUser } = this.state;
    // console.log(e.target.value);
    const userQuery = e.target.value;

    currentUser.getJoinableRooms()
      .then((rooms) => {
        const joinableRooms = rooms.filter((room) => {
          if (userQuery !== '') {
            return (room.name.toLowerCase().includes(userQuery.toLowerCase()));
          }
          return '';
        });
        this.setState({ searchResults: joinableRooms });
      })
      .catch(err => console.log(`Error getting joinable rooms: ${err}`));
  }

  joinRoom(e) {
    const { currentUser } = this.state;
    const { searchResults } = this.state;
    const roomTarget = e.target.textContent;

    // find the room with the right name, then grab the id from the resulting object
    const roomTargetId = searchResults
      .find(room => room.name === roomTarget)
      .id;

    currentUser.joinRoom({ roomId: roomTargetId })
      .then((room) => {
        console.log(`Joined room with ID: ${room.id}`);
        this.getUpdatedUserRooms(room);
      })
      .catch(err => console.log(`Error joining room ${roomTargetId}: ${err}`));

    // this.updateRoomSubscriptions();
  }

  createNewRoom(roomName, isPrivate) {
    const { currentUser } = this.state;
    currentUser.createRoom({
      name: roomName,
      private: isPrivate,
    })
      .then((room) => {
        console.log(`Created new room ${room.name}`);
        this.getUpdatedUserRooms(room);
      })
      .catch(err => console.log(`Error creating room: ${err}`));
    // switching to new room room and sending a message after creation
    // causes the new messages to not show up
  }

  deleteRoom(stringArg) {
    const { userRooms, currentUser, currentRoom } = this.state;
    const roomToDelete = userRooms.find(room => room.name.toLowerCase() === stringArg);
    console.log(roomToDelete);
    if (roomToDelete !== '') {
      currentUser.deleteRoom({ roomId: roomToDelete.id })
        .then(() => {
          console.log(`Deleted room ${currentRoom.name}`);
          this.setState({ currentRoom: currentUser.rooms[0] });
        })
        .catch(err => this.handleErrs(err));
    }
  }

  render() {
    const { userRooms, currentRoom, messages, currentUser, searchResults } = this.state;

    return(
      <div className="Chat">
        <RoomList
          userRooms={userRooms}
          changeActiveRoom={this.changeActiveRoom}
          currentRoom={currentRoom}
          createNewRoom={this.createNewRoom}
          currentUser={currentUser}
          updateRoomSubscriptions={this.updateRoomSubscriptions}
          findJoinableRooms={this.findJoinableRooms}
          joinRoom={this.joinRoom}
          searchResults={searchResults}
        />
        <MessageList
          messages={messages}
          currentUser={currentUser}
        />
        <SendMessageForm handleFormKeySubmit={this.handleFormKeySubmit} />
      </div>
    );
  }
}
