/**
 * Allow press enter (e.which === 13) to trigger clicking sign in
 */

import React, { Component } from 'react';
import './SignIn.css';

export default class SignIn extends Component {
  constructor(props) {
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
    const { onRouteChange, loadUser } = this.props;
    const { signInEmail, signInPassword } = this.state;
      fetch('/signin', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: signInEmail,
          password: signInPassword
        })
      })
      .then(res => res.json())
      .then(response => {
        // if the response is a user, call onRouteChange, otherwise, log response
        response.user_name ? onRouteChange('chat', response.user_name)
        : console.log(response);
          // loadUser();
      })
      .catch(err => console.log(err.statusCode, 'Failed to sign in', err));
  }

  render() {
    const { onRouteChange, debounce } = this.props;
    // submit signin on press ENTER
    window.addEventListener('keypress', debounce((e) => {
      if(e.which === 13) {
        this.onSubmitSignIn();
      }      
    }, 500));
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
              <button id="register-btn" onClickCapture={() => onRouteChange('register')}>Register</button>
            </div>
          </div>
        </main>
      </article>
    );
  }
}