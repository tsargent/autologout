// from Jeff:
// auth currently returns this info: 
// {
//   "scopes": [
//       "scim:write",
//       "scim:read"
//   ],
//   "expires_in_seconds": 43199,
//   "application": {
//       "uid": "5mRjqdD"
//   },
//   "created_at": 1585597311,
//   "token": {
//       "access_token": null
//   }
// }
// when we bump the expiration it just adds the time to expires_in . 
// So the actual time that the token expires is created_at  + expires_in in unix timestamp.

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import AutoLogout from "./Autologout";
import "bootstrap/dist/css/bootstrap.css";
import 'promise-polyfill/src/polyfill';

const nowSeconds = () => Math.floor(Date.now() / 1000);

const setExpiration = () => new Promise((resolve) => {
  setTimeout(() => {
    const now = nowSeconds();
    const interval = 30;
    const payload = {
      created_at: now,
      expires_at: now + interval,
      expires_in_seconds: interval,
    }
    localStorage.setItem('fakeAuth', JSON.stringify(payload));
    resolve(payload);
  }, 200);
});

const getExpiration = () => new Promise((resolve) => {
  setTimeout(() => {
    const authData = JSON.parse(localStorage.getItem('fakeAuth'));
    const { expires_at } = authData;
    const now = nowSeconds();
    resolve(expires_at - now);
  }, 200)
})

const Notifier = ({expiration, isActive, onClickContinue}) => {
  return (
    <div className="bg-light p-4 m-4">
      <p>
        Notifier container<br/>
        {expiration}<br/>
        {isActive ? 'true' : 'false'}
      </p>
      <button className="btn btn-secondary mr-1" onClick={onClickContinue}>Continue</button> 
      <button className="btn btn-primary ml-1">Log off</button> 
    </div>
  )
}

const FormattedTime = ({utcSeconds}) => {
  const d = new Date(0);
  d.setUTCSeconds(utcSeconds);
  return d.toTimeString();
}

ReactDOM.render(
  <React.StrictMode>
    <AutoLogout setExpiration={setExpiration} getExpiration={getExpiration}>
      {({expiration, isActive, showNotifier, onClickContinue}) => (
        <>
          <App />
          <pre className="bg-dark text-white p-4 m-4">
            User is active: {isActive ? 'true' : 'false'}<br />
            Expires at: {expiration && <FormattedTime utcSeconds={expiration} />}
          </pre>
          {showNotifier && (
            <Notifier expiration={expiration} isActive={isActive} onClickContinue={onClickContinue}/>
          )}
        </>
      )}
    </AutoLogout>
  </React.StrictMode>,
  document.getElementById('root')
);
