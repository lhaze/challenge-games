import React, { Component } from 'react';
import { Button, Col, Grid, Row } from 'react-bootstrap';
import logo from './logo.svg';
import './ReactShowcase.css';


export default class ReactShowcase extends Component {
    render() {
        return (
            <div className="ReactShowcase">
              <div className="ReactShowcase-header">
                <img src={logo} className="ReactShowcase-logo" alt="logo" />
              </div>
              <Screen />
            </div>
        );
    }
}

class Screen extends Component {
    render() {
        return (
            <Grid>
                <Row className="show-grid">
                    <Mapboard md={8} xs={8} />
                    <ResourceTray mdOffset={1} xsOffset={1} md={3} xs={3} />
                </Row>
            </Grid>
        );
    }
}

class Mapboard extends Component {
    render() {
        return (
            <Col {... this.props }>
                <h5>Mapboard</h5>
                <Button bsStyle="warning">Fooo</Button>
            </Col>
        );
    }
}

class ResourceTray extends Component {
    render() {
        return (
            <Col {... this.props }>
                <h5>Resource Tray</h5>
            </Col>
        );
    }
}
