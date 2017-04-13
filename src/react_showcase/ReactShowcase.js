import React, { Component } from 'react';
import logo from './logo.svg';
import './ReactShowcase.css';


class ReactShowcase extends Component {
    render() {
        return (
            <div className="ReactShowcase">
              <div className="ReactShowcase-header">
                <img src={logo} className="ReactShowcase-logo" alt="logo" />
                <h2>challenge-games React showcase</h2>
              </div>
              <p className="ReactShowcase-intro">
              </p>
            </div>
        );
    }
}

export default ReactShowcase;
