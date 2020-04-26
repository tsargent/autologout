import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce'
import utcSecondsToString from './utcSecondsToString';

/* Time values to consider:
- logoutValue
  The time in seconds it takes to logout due to inactivity.

- warningDifference
  The time in seconds during which we see the warning. 
  It will first appear at logoutValue - warningDifference seconds until logout.

- logDebounceValue
  The time in seconds we wait to assume the user has become inactive.
*/

/* 15 minutes = 900 seconds */

const logoutValue = 900;
const warningDifference = 60;
const debounceValue = 5;

const fakeUpdate = ({
  lastActive,
}) => new Promise((resolve) => {
  setTimeout(() => {
    /* Server could tell us how long the cookie should last for.
    15 minutes in this case. Or it could calculate that new expiration time
    and give us that. */
    const serverExpirationPeriod = logoutValue;
    const newExpiration =  lastActive + serverExpirationPeriod;
    const newExpirationString = utcSecondsToString(newExpiration);
    resolve({
      newExpiration,
      newExpirationString,
    });
  }, 20);
});

class AutoLogout2 extends React.Component {

  constructor(props) {
    super(props);
    this.events = [
      'click',
      'keydown',
      'mousemove',
      'scroll',
    ];

    this.logDebounceValue = debounceValue;

    // the length of time in seconds from last action to warning
    this.warnValue = logoutValue - warningDifference;

    // the length of time in seconds from last action to logout
    this.logoutValue = logoutValue;

    this.resetTimers = this.resetTimers.bind(this);
    this.logInactivity = debounce(this.logInactivity.bind(this), this.logDebounceValue * 1000);
    this.warn = this.warn.bind(this);
    this.logout = this.logout.bind(this);

    this.events.forEach((event) => {
      window.addEventListener(event, this.resetTimers);
      window.addEventListener(event, this.logInactivity);
    });

    this.state = {
      warn: false,
      logout: false,
    }

    // log immediately. Because it is debounced, it will not fire if the user begins interacting
    // within the debounce value time.
    this.logInactivity();

    // start timers immediately
    this.setTimers();
  }

  logInactivity() {
    /* Get the current time in UTC seconds. This is [logDebounceValue] seconds after 
    we stopped activity. */
    const now = Math.floor(Date.now() / 1000);

    /* Adjust the above value to get the exact time at which we stopped activity. */
    const adjusted = now - (this.logDebounceValue);
    const adjustedString = utcSecondsToString(adjusted);

    /* Tell the server when we stopped, and get a new expiration back. */
    this.props.updateActivity({
      lastActive: adjusted,
    }).then((data) => this.setState(data));

    this.setState({ 
      lastActive: adjusted,
      lastActiveString: adjustedString,
    });
  }

  setTimers() {
    /* Set two timers for the warning and final logout. These are always running,
    but are continuously being reset then there is activity. */
    this.warningTimeout = setTimeout(this.warn, this.warnValue * 1000);
    this.logoutTimeout = setTimeout(this.logout, this.logoutValue * 1000);
  }

  clearTimers() {
    clearTimeout(this.warningTimeout);
    clearTimeout(this.logoutTimeout);
  }

  resetTimers() {
    /* Resetting the timers just involves clearing them and starting them again. 
    They never stop without restarting. */
    this.clearTimers();
    this.setTimers();
  }

  warn() {
    this.setState({ warn: true });
  }

  logout() {
    this.setState({ logout: true });
  }

  render() {
    const state =  this.state;
    return this.props.children({
      ...state,
    });
  }
}

AutoLogout2.defaultProps = {
  updateActivity: fakeUpdate,
};

AutoLogout2.propTypes = {
  updateActivity: PropTypes.func,
};

export default AutoLogout2;
