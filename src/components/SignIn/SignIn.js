import React, { Component } from 'react';
import './SignIn.css';

export default class SignIn extends Component {
  constructor() {
    super();
    this.state = {
      signInEmail: '',
      signInPassword: ''
    }
  }

  onEmailChange = (event) => {
    this.setState({signInEmail: event.target.value});
  }

  onPasswordChange = (event) => {
    this.setState({signInPassword: event.target.value});
  }

  onSubmitSignIn = () => {
    fetch('http://localhost:3001/signin', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: this.state.signInEmail,
        password: this.state.signInPassword
      })
    })
      .then(response => response.json())
      .then(user => {
        if (user.id) {
          this.props.loadUser(user);
          this.props.onRouteChange('home');
        }
      })
      .catch(err => console.log(err.statusCode, 'Failed to sign in', err));
  }

  render() {
    const { onRouteChange } = this.props;
    return(
      <article className='sign-in'>
        <main>
          <h1>Chat App</h1>
          <div>
            <fieldset id="sign-up">
              <legend>Sign In</legend>
              <div>
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
              </div>
            </fieldset>
            <div>
              <button
                onClickCapture={this.onSubmitSignIn}
                type="submit"
                value="Sign in"
              >
              Sign In
              </button>
              <button onClickCapture={() => onRouteChange('register')}>Register</button>
            </div>
          </div>
        </main>
      </article>
    );
  }
}