import React from 'react';
import ReactDOM from 'react-dom';
import ReactShowcase from '../ReactShowcase';


describe('ReactShowcase', () => {
    test('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<ReactShowcase />, div);
    });
});
