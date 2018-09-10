import React from 'react';
import Message from '../Message/Message';
// import './MessageList.css';

const MessageList = ({ messages }) => {
  return(
    <div className='MessageList'>
      {messages.map((message, index) => {
        let mydate = new Date(message.createdAt);
        return (
          <Message key={index} username={message.senderId} text={message.text} timestamp={mydate.toLocaleString()}/>
        );
      })}
    </div>
  );
}

export default MessageList;