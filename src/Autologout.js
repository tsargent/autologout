import React from "react";
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce'

class AutoLogout extends React.Component {

  constructor(props) {
    super(props);
    this.notifierTimeout = null;
    this.pollInterval = null;
    this.handleStorageChange = this.handleStorageChange.bind(this);
    this.activityStart = this.activityStart.bind(this);
    this.activityPause = debounce(this.activityPause.bind(this), this.props.activityDelay * 1000);
    this.onClickContinue = this.onClickContinue.bind(this);
    this.state = {
      isActive: false,
      expiration: null,
      showNotifier: false,
    }
  }

  componentDidMount() {
    window.addEventListener('storage', this.handleStorageChange);
    this.addEventListeners();
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevState.showNotifier && !this.state.showNotifier) {
      this.addEventListeners();
    }

    if(!prevState.showNotifier && this.state.showNotifier) {
      this.removeEventListeners();
    }
  }

  addEventListeners() {
    this.props.events.forEach(e => {
      document.addEventListener(e, this.activityStart);
      document.addEventListener(e, this.activityPause);
    });
  }

  removeEventListeners() {
    this.props.events.forEach(e => {
      document.removeEventListener(e, this.activityStart);
      document.removeEventListener(e, this.activityPause);
    });
  }

  handleStorageChange() {
    const storageState = this.getLocalStorage();
    this.setState(storageState);
  }

  activityStart() {
    clearInterval(this.pollInterval);
    clearTimeout(this.notifierTimeout);
    if(!this.state.isActive) {
      this.setStateAndStorage({ isActive: true, expiration: null, showNotifier: false });
    }
  }

  getExpiration() {
    this.props.getExpiration().then(data => {
      console.log("getExpiration data:", data)
    })
  }

  pollExpiration() {
    if(!this.state.isActive) {
      this.pollInterval = setInterval(() => this.getExpiration(), 2000);
    } else {
      clearInterval(this.pollInterval);
    }
  }

  activityPause() {
    clearTimeout(this.notifierTimeout);
    clearInterval(this.pollInterval);
    this.setStateAndStorage({ isActive: false });

    this.pollExpiration();

    this.props.setExpiration().then(({ created_at, expires_in_seconds }) => {
      const expiration = created_at + expires_in_seconds;
      this.setStateAndStorage({ expiration });

      const now = Math.floor(Date.now() / 1000);

      const notifierTimer = (expires_in_seconds - this.props.notifierTime) * 1000
      
      console.log('now', now);
      console.log('created_at', created_at);
      console.log('notifierTimer', notifierTimer);

      this.notifierTimeout = setTimeout(() => {
        this.setStateAndStorage({ showNotifier: true })
      }, notifierTimer);
    });
  }

  setLocalStorage(state) {
    if(window.localStorage) {
      const { localStorageKey } = this.props;
      const storage = this.getLocalStorage();
      localStorage.setItem(localStorageKey, JSON.stringify({...storage, ...state}));
    }
  }

  getLocalStorage() {
    const { localStorageKey } = this.props;
    if(window.localStorage && window.localStorage.getItem(localStorageKey)) {
      return JSON.parse(localStorage.getItem(localStorageKey));
    }
  }

  setStateAndStorage(data) {
    this.setState(data, this.setLocalStorage(data));
  }

  onClickContinue() {
    this.activityStart();
  }

  render() {
    const { isActive, expiration, showNotifier } = this.state;
    return this.props.children({
        expiration,
        isActive,
        showNotifier,
        onClickContinue: this.onClickContinue,
      })
  }
}

AutoLogout.defaultProps = {
  activityDelay: 3,
  events: [
    'click',
    'keydown',
    'mousemove',
  ],
  localStorageKey: 'inactivity',
  notifierTime: 25,
}

AutoLogout.propTypes = {
  activityDelay: PropTypes.number,
  events: PropTypes.arrayOf(PropTypes.string),
  localStorageKey: PropTypes.string,
  notifierTime: PropTypes.number,
}

export default AutoLogout;
