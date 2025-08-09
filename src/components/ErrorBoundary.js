import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Ici vous pouvez ajouter votre logique de logging d'erreur
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Interface utilisateur de repli en cas d'erreur
      return (
        <Result
          status="error"
          title="Une erreur est survenue"
          subTitle="Nous nous excusons pour la gêne occasionnée. Veuillez réessayer."
          extra={[
            <Button 
              type="primary" 
              key="reload"
              onClick={() => window.location.reload()}
            >
              Recharger la page
            </Button>,
            <Button 
              key="home"
              onClick={() => window.location.href = '/'}
            >
              Retour à l'accueil
            </Button>
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 