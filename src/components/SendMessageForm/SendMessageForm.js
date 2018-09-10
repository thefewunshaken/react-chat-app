import React, { Component } from 'react';
import './SendMessageForm.css';

const SendMessageForm = ({ handleFormKeySubmit }) => {
  return(
    <div className='SendMessageForm'>
      {/* <form id="message-form"> */}
        <textarea
          autoComplete="off"
          label="message-text"
          id="message-text"
          placeholder='Type your message...'
          onKeyPressCapture={handleFormKeySubmit}
        />
        <button id="send"></button>
      {/* </form> */}
    </div>
  );
}

export default SendMessageForm;