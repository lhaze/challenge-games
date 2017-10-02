import React, { Component } from 'react';
import { Badge, Button, ButtonToolbar, Col, Glyphicon, Grid, Row } from 'react-bootstrap';
import logo from './logo.svg';
import './ReactShowcase.css';


function nameToStyle(name) {
    return {
        'red': 'danger',
        'green': 'success',
        'blue': 'primary'
    }[name];
}


function nameToColor(name) {
    return {
        'red': '#d9534f',
        'green': '#5cb85c',
        'blue': '#337ab7'
    }[name];
}


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
                <Row>
                    <Col>
                        <ButtonToolbar>
                            <ResourceGenerator resourceName="red" />
                            <ResourceGenerator resourceName="green" />
                            <ResourceGenerator resourceName="blue" />
                            <RemoveResource />
                        </ButtonToolbar>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Badge>500</Badge>
                    </Col>
                </Row>
            </Col>
        );
    }
}


class ResourceGenerator extends Component {
    render() {
        return (
            <Button bsStyle={ nameToStyle(this.props.resourceName) }>+</Button>
        );
    }
}

ResourceGenerator.propTypes = {
    resourceName: React.PropTypes.string
};


class RemoveResource extends Component {
    render() {
        return (
            <Button><Glyphicon glyph="ban-circle" /></Button>
        );
    }
}

RemoveResource.propTypes = {
    resourceName: React.PropTypes.string
};
