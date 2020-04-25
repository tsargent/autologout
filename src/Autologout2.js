import React from 'react';
import debounce from 'lodash.debounce'
import utcSecondsToString from './utcSecondsToString';

// https://www.epochconverter.com/

class AutoLogout2 extends React.Component {

  constructor(props) {
    super(props);
    this.events = [
      'click',
      'keydown',
      'mousemove',
      'scroll',
    ];
    this.resetTimers = this.resetTimers.bind(this);
    this.logDebounceValue = 5000;
    this.logInactivity = debounce(this.logInactivity, this.logDebounceValue);

    this.events.forEach((event) => {
      window.addEventListener(event, this.resetTimers);
    });

    this.setTimers();
  }

  logInactivity() {
    const now = Math.floor(Date.now() / 1000);
    const adjusted = now - (this.logDebounceValue / 1000);
    console.log(utcSecondsToString(adjusted));
    console.log('log inactivity:', adjusted);
  }

  setTimers() {
    this.logInactivity();
    this.warningTimeout = setTimeout(this.warn, 5000);
    this.logoutTimeout = setTimeout(this.logout, 8000);
  }

  clearTimers() {
    clearTimeout(this.warningTimeout);
    clearTimeout(this.logoutTimeout);
  }

  resetTimers() {
    this.clearTimers();
    this.setTimers();
  }

  warn() {
    console.log('warn');
  }

  logout() {
    console.log('logout');
  }

  render() {
    return this.props.children({});
  }
}


export default AutoLogout2;
