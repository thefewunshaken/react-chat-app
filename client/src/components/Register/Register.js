import React, { Component } from 'react';
import '../SignIn/SignIn.css';

export default class Register extends Component {
  constructor() {
    super();
    this.state = {
      registerFirstName: '',
      registerLastName: '',
      registerEmail: '',
      registerUsername: '',
      registerPassword: '',
    }
  }

  onFirstNameChange = (event) => {
    this.setState({registerFirstName: event.target.value});
  }

  onLastNameChange = (event) => {
    this.setState({registerLastName: event.target.value});
  }

  onEmailChange = (event) => {
    this.setState({registerEmail: event.target.value});
  }

  onUsernameChange = (event) => {
    this.setState({registerUsername: event.target.value});
  }

  onPasswordChange = (event) => {
    this.setState({registerPassword: event.target.value});
  }

  onSubmitRegister = (event) => {
    // if(this.state.registerPassword !== this.state.confirmRegisterPassword) {
    //   alert('Passwords do not match');
    //   return;
    // }
    fetch('/register', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        firstName: this.state.registerFirstName,
        lastName: this.state.registerLastName,
        email: this.state.registerEmail,
        username: this.state.registerUsername,
        password: this.state.registerPassword
      })
    })
      .then(response => response.json())
      .then(user => {
        console.log(user);
          // this.props.loadUser(user);
          this.props.onRouteChange('chat', user.user_name);
      })
  }

  render() {
    const { onRouteChange, debounce } = this.props;

    window.addEventListener('keypress', debounce((e) => {
      if(e.which === 13) {
        this.onSubmitRegister();
      }      
    }, 500));

    return(
      <article className='register'>
        <main>
          <h1>Chat App</h1>
          <div>
            <fieldset id="register">
              <legend>Register</legend>
              <div>
              <input
                onChange={this.onFirstNameChange}
                name="first-name"
                id="first-name"
                placeholder='first name'
                />
              <input
                onChange={this.onLastNameChange}
                name="last-name"
                id="last-name"
                placeholder='last name'
                />
                <input
                  onChange={this.onEmailChange}
                  type="email"
                  name="email-address"
                  id="email-address"
                  placeholder='email'
                />
                <input
                  onChange={this.onUsernameChange}
                  name="username"
                  id="username"
                  placeholder='username'
                />
                <input
                  onChange={this.onPasswordChange}
                  type="password"
                  name="password"
                  id="password"
                  placeholder='password'
                />
              </div>
            </fieldset>
            <div>
              <button onClickCapture={() => onRouteChange('signin')}>Sign In</button>
              <button id="register-btn" onClickCapture={this.onSubmitRegister}>Register</button>
            </div>
          </div>
        </main>
      </article>
    );
  }
}