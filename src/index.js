import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Link } from "@reach/router"
import App from './App';
import AutoLogout from "./Autologout";
import "bootstrap/dist/css/bootstrap.css";
import 'promise-polyfill/src/polyfill';

const Notifier = ({ onClickContinue }) => {
  return (
    <div className="modal" tabIndex="-1" role="dialog" style={{display: 'block'}}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-body">
            <p>You will be logged out soon due to inactivity.</p>
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

const Main = () => {
  return (
    <div>
      <AutoLogout>
        {(args) => (
          <>
            <pre className="bg-dark text-white p-4 m-4">
              {JSON.stringify(args, null,  2)}
            </pre>
            {args.warn && (
              <Notifier onClickContinue={args.onClickContinue}/>
            )}
          </>
        )}
      </AutoLogout>
      <App />   
    </div>
  )
}

ReactDOM.render(
  <Router>
    <Main path="/" />
  </Router>,
  document.getElementById('root')
);
