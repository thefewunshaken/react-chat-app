import React, { Component } from 'react';
import '../SignIn/SignIn.css';

export default class Register extends Component {
  constructor() {
    super();
    this.state = {
      registerName: '',
      registerEmail: '',
      registerPassword: '',
      confirmRegisterPassword: ''
    }
  }

  onNameChange = (event) => {
    this.setState({registerName: event.target.value});
  }

  onEmailChange = (event) => {
    this.setState({registerEmail: event.target.value});
  }

  onPasswordChange = (event) => {
    this.setState({registerPassword: event.target.value});
  }

  onConfirmPasswordChange = (event) => {
    this.setState({confirmRegisterPassword: event.target.value});
  }

  onSubmitRegister = (event) => {
    if(this.state.registerPassword !== this.state.confirmRegisterPassword) {
      alert('Passwords do not match');
      return;
    }
    fetch('http://localhost:3001/register', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: this.state.registerName,
        email: this.state.registerEmail,
        password: this.state.registerPassword
      })
    })
      .then(response => response.json())
      .then(user => {
        if (user.id) {
          this.props.loadUser(user);
          this.props.onRouteChange('home');
        }
      })
  }

  render() {
    const { onRouteChange } = this.props;
    return(
      <article className='register'>
        <main>
          <h1>Chat App</h1>
          <div>
            <fieldset id="register">
              <legend>Register</legend>
              <div>
              <input
                  name="name"
                  id="name"
                  placeholder='name'
                />
                <input
                  onChange={this.onEmailChange}
                  type="email"
                  name="email-address"
                  id="email-address"
                  placeholder='email'
                />
                <input
                  onChange={this.onPasswordChange}
                  type="password"
                  name="password"
                  id="password"
                  placeholder='password'
                />
                <input
                  name="username"
                  id="username"
                  placeholder='username'
                />
              </div>
            </fieldset>
            <div>
              <button onClickCapture={() => onRouteChange('register')}>Register</button>
            </div>
          </div>
        </main>
      </article>
    );
  }
}