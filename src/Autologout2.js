import React from 'react';
import debounce from 'lodash.debounce'
import utcSecondsToString from './utcSecondsToString';

// https://www.epochconverter.com/'

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
    this.logDebounceValue = 5 * 1000;
    this.warnValue = 10 * 1000;
    this.logoutValue = 15 * 1000; 
    this.logInactivity = debounce(this.logInactivity.bind(this), this.logDebounceValue);

    this.events.forEach((event) => {
      window.addEventListener(event, this.resetTimers);
      window.addEventListener(event, this.logInactivity);
    });

    // log immediately. Because it is debounced, it will not fire if the user begins interacting
    // within the debounce value time.
    this.logInactivity();

    // start timers immediately
    this.setTimers();
  }

  logInactivity() {
    const now = Math.floor(Date.now() / 1000);
    const adjusted = now - (this.logDebounceValue / 1000);
    const adjustedString = utcSecondsToString(adjusted);
    this.setState({ 
      lastActiveSeconds: adjusted,
      lastActiveString: adjustedString,
    });
    console.log('log inactivity:', { adjusted, adjustedString });
  }

  setTimers() {
    this.warningTimeout = setTimeout(this.warn, this.warnValue);
    this.logoutTimeout = setTimeout(this.logout, this.logoutValue);
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
    const state =  this.state;
    return this.props.children({
      ...state,
    });
  }
}

export default AutoLogout2;
