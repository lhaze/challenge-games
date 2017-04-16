import React from 'react';
import ReactDOM from 'react-dom';
import ReactShowcase from './react_showcase/ReactShowcase';
import './index.css';


const root = document.getElementById('root');

if (!!root) {
    ReactDOM.render(<ReactShowcase />, root);
}
