import React from 'react';
import { Link } from "@reach/router"

function App() {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-light">
        <div className="navbar-nav ml-md-auto">
          <Link to="sign-in" className="btn btn-secondary">Log out</Link>
        </div>
      </nav>
      <div className="container">
        <div className="row">
          <div className="col">
            <p>
              <a target="_blank" href="/">Open new tab</a> to show synchronization.
            </p>
            <form>
              <div className="form-group">
                <label htmlFor="input1">Input 1</label>
                <input id="input1" type="text" className="form-control" />
              </div>
              <div className="form-group">
                <label htmlFor="input2">Input 2</label>
                <input id="input2" type="text" className="form-control" />
              </div>
              <button className="btn btn-primary">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
