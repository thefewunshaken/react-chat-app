/** ==> Notes for improvement
 *   ✔ differentiate between fetched messages and sent messages
 *   ✔ scroll chat to bottom if sending a message or if scrollbar
 *     is already at the bottom
 *   ✖ Remember scroll location in the previous room
 *   ✔ Begin scrollbar at the bottom
 *   ✖ visual notification for a new fetchedMessage in a room
 *   ✖ look into cookies, saving login info locally to user's computer
 *  ==> Tasks
 *  ✔ Finish front-end functionality for chatting
 *     • indicate current Room
 *     • change Rooms
 *     • create Room
 *     • add/remove users to a Room
 *  ✔ Block chat behind a login wall
 *  ✔ Create login system
 *  ✔ Make Chat component and refactor App.js
 *  ✖ Debounced signin and register is causing multiple sends of
 *    signin/register requests. I think I need to place the debounce on the
 *    actual signin/register fn rather than the event listener
 */

import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import Chat from './components/Chat/Chat';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      route: 'signin',
      // route: 'chat', // strictly for testing
      isSignedIn: false,
      userId: '',
    };
    // allow access to this
    this.connectToServer = this.connectToServer.bind(this);
    this.onRouteChange = this.onRouteChange.bind(this);
  }

  componentDidMount() {
    this.connectToServer();
  }

  onRouteChange(route, username = '') {
    if (route === 'chat' && username !== '') {
      this.setState({ userId: username });
      this.setState({ isSignedIn: true });
    }
    this.setState({ route });
  }

  connectToServer() {
    fetch('/');
  }

  // throttle(callback, limit) {
  //   let wait = false;

  //   return function() {
  //     if (!wait) {
  //       callback.apply(this, arguments);
  //       wait = true;
  //       setTimeout(function() {
  //         wait = false;
  //       }, limit);
  //     }
  //   }
  // }

  debounce(callback, time) {
    let timeout;

    return function() {
      const functionCall = () => callback.apply(this, arguments);

      clearTimeout(timeout);
      timeout = setTimeout(functionCall, time);
    }
  }

  render() {
    const { route, isSignedIn, userId } = this.state;
    return (
      <Router>
        <div className="App">
          { route === 'chat' && userId !== ''
            ? <Route exact path="/" render={()=><Chat userId={userId} isSignedIn={isSignedIn}/>}/>
            : (
              route === 'signin'
              ? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} debounce={this.debounce}/>
              : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} debounce={this.debounce}/>
            )
          }
        </div>
      </Router>
    );
  }
}

export default App;
