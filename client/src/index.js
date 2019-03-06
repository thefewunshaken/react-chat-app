import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

render((
  <Router>
    <App />
  </Router>),
  document.getElementById('root'));

registerServiceWorker();
