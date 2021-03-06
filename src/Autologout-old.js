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
    // TODO: This is an issue in IE, but we need this to communicate between tabs. ???
    // https://stackoverflow.com/questions/18265556/why-does-internet-explorer-fire-the-window-storage-event-on-the-window-that-st
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
    this.props.events.forEach(event => {
      document.addEventListener(event, this.activityStart);
      document.addEventListener(event, this.activityPause);
    });
  }

  removeEventListeners() {
    this.props.events.forEach(event => {
      document.removeEventListener(event, this.activityStart);
      document.removeEventListener(event, this.activityPause);
    });
  }

  // this will only fire in non-active tabs
  handleStorageChange(e) {
    console.log(e);
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
    this.props.getExpiration().then((data) => {
      console.log("getExpiration data:", data);
      this.setState({
        expirationTimer: data.expires_in_seconds,
      })
    })
  }

  pollExpiration() {  
    if(!this.state.isActive) {
      this.pollInterval = setInterval(() => this.getExpiration(), 1000);
    }
  }

  activityPause() {
    clearTimeout(this.notifierTimeout);
    clearInterval(this.pollInterval);
    this.setStateAndStorage({ isActive: false });

    this.pollExpiration();

    this.props.setExpiration().then(({ created_at, expires_at, expires_in_seconds }) => {
      this.setStateAndStorage({
        expirationTimer: expires_in_seconds,
        createdAt: created_at,
        expiresAt: expires_at,
      });

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
    const { isActive, expiresAt, showNotifier } = this.state;
    const onClickContinue = this.onClickContinue;
    return this.props.children({
        expiresAt,
        isActive,
        showNotifier,
        onClickContinue,
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
  notifierTime: 10,
}

AutoLogout.propTypes = {
  activityDelay: PropTypes.number,
  events: PropTypes.arrayOf(PropTypes.string),
  localStorageKey: PropTypes.string,
  notifierTime: PropTypes.number,
}

export default AutoLogout;
