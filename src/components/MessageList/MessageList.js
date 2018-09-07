import React, { Component } from 'react';
import './MessageList.css';

const DUMMY_DATA = [
  {
    senderId: 'user1',
    text: 'Hey, what up yo? You wanna catch a movie bruh? I hear that new super awesome movie is coming out in theaters'
  },
  {
    senderId: 'user2',
    text: 'Hey, what up yo?'
  },
  {
    senderId: 'user3',
    text: 'Wubba lubba dub dub!!!'
  },
]

const MessageList = () => {
  return(
    <div className='MessageList'>
      {DUMMY_DATA.map((message, index) => {
        return (
          <div key={index}>
            <div>{message.senderId}</div>
            <div className='message'>{message.text}</div>
          </div>
        );
      })}
    </div>
  );
}

export default MessageList;