import React from 'react';
import './Message.css';

const Message = ({ username, text, timestamp, currentUser }) => {
  return username === currentUser.id ? //determine if message is being sent or fetched
    (
      <div className='message-block sent-message'>
        <div className='message'>{text}</div>
        <div className='timestamp'>{timestamp}</div>
      </div>
    ) :
    (
      <div className='message-block fetched-message'>
        <div className='username-box'>{username.substring(0,2).toUpperCase()}</div>
        <div className='message'>{text}</div>
        <div className='timestamp'>{timestamp}</div>
      </div>
    );
}

export default Message;