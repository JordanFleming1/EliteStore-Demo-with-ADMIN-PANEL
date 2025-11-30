import React from 'react';
import { Spinner, Container, Row, Col } from 'react-bootstrap';

const AuthLoader: React.FC = () => (
  <Container className="py-5">
    <Row>
      <Col xs={12} className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading...</p>
      </Col>
    </Row>
  </Container>
);

export default AuthLoader;
