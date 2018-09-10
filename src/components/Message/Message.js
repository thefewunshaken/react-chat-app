import React from 'react';
import './Message.css';

const Message = ({ username, text, timestamp }) => {
    return (
      <div className='message-block'>
        <div className='username-box'>{username.substring(0,2).toUpperCase()}</div>
        <div className='message'>{text}</div>
        <div className='timestamp'>{timestamp}</div>
      </div>
    );
}

export default Message;