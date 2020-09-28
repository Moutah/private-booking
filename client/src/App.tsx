import React, { Component } from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Routes from "./routes";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="container">
          <h2>MERN-Stack Todo App</h2>

          <nav className="navbar">
            <Link to="/">Login</Link>
            <Link to="/items">Items</Link>
            <Link to="/items/lulz">One Item</Link>
          </nav>

          <Routes />
        </div>
      </Router>
    );
  }
}

export default App;
