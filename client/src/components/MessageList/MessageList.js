import React from 'react';
import Message from '../Message/Message';

const MessageList = ({ messages, currentUser }) => {
  return messages ? (
    <div className='MessageList'>
      {messages.map((message, index) => {
        let mydate = new Date(message.createdAt);
        return (
          <Message key={index} username={message.senderId} text={message.text} timestamp={mydate.toLocaleString()} currentUser={currentUser}/>
        );
      })}
    </div>
  ) : null;
}

export default MessageList;