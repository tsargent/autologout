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
import { Router, Link, useNavigate } from "@reach/router"
import App from './App';
import AutoLogout from "./Autologout";
import "bootstrap/dist/css/bootstrap.css";
import 'promise-polyfill/src/polyfill';

const nowSeconds = () => Math.floor(Date.now() / 1000);

const setExpiration = () => new Promise((resolve) => {
  setTimeout(() => {
    const now = nowSeconds();
    const interval = 20;
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

const Notifier = ({ onClickContinue }) => {
  return (
    <div className="modal" tabIndex="-1" role="dialog" style={{display: 'block'}}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Some words</h5>
          </div>
          <div className="modal-body">
            <p>Some more words.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onClickContinue}>Continue</button>
            <Link to="sign-in" className="btn btn-secondary">Log out</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const FormattedTime = ({utcSeconds}) => {
  const d = new Date(0);
  d.setUTCSeconds(utcSeconds);
  return d.toTimeString();
}

const SignIn = () => (
  <>
    <h2>Sign in</h2>
    <Link to="/" className="btn btn-primary">Sign in</Link>
  </>
)

const Main = () => {
  const navigate = useNavigate();
  const logout = () => navigate("sign-in");
  return (
    <AutoLogout setExpiration={setExpiration} getExpiration={getExpiration} onTimeout={logout}>
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
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Main path="/" />
      <SignIn path="sign-in" />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
