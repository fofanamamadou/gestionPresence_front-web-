import { message } from 'antd';

// Types d'erreurs personnalisés
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  CSRF_ERROR: 'CSRF_ERROR'
};

// Messages d'erreur personnalisés
const ErrorMessages = {
  [ErrorTypes.NETWORK_ERROR]: 'Erreur de connexion au serveur',
  [ErrorTypes.AUTH_ERROR]: 'Session expirée, veuillez vous reconnecter',
  [ErrorTypes.VALIDATION_ERROR]: 'Données invalides',
  [ErrorTypes.SERVER_ERROR]: 'Une erreur est survenue sur le serveur',
  [ErrorTypes.NOT_FOUND]: 'Ressource non trouvée',
  [ErrorTypes.PERMISSION_ERROR]: 'Vous n\'avez pas les permissions nécessaires',
  [ErrorTypes.CSRF_ERROR]: 'Erreur de sécurité CSRF'
};

// Fonction pour formater les erreurs de validation Django
const formatDjangoErrors = (errors) => {
  if (typeof errors === 'string') return errors;
  
  if (typeof errors === 'object') {
    return Object.entries(errors)
      .map(([field, messages]) => {
        if (Array.isArray(messages)) {
          return `${field}: ${messages.join(', ')}`;
        }
        if (typeof messages === 'object') {
          return formatDjangoErrors(messages);
        }
        return `${field}: ${messages}`;
      })
      .join('\n');
  }
  
  return 'Une erreur est survenue';
};

// Fonction pour déterminer le type d'erreur
export const getErrorType = (error) => {
  if (!error.response) {
    return ErrorTypes.NETWORK_ERROR;
  }

  const { status } = error.response;

  switch (status) {
    case 401:
      return ErrorTypes.AUTH_ERROR;
    case 403:
      return error.response.data?.detail?.includes('CSRF') 
        ? ErrorTypes.CSRF_ERROR 
        : ErrorTypes.PERMISSION_ERROR;
    case 400:
      return ErrorTypes.VALIDATION_ERROR;
    case 404:
      return ErrorTypes.NOT_FOUND;
    case 500:
    default:
      return ErrorTypes.SERVER_ERROR;
  }
};

// Gestionnaire d'erreurs principal
export const handleError = (error) => {
  const errorType = getErrorType(error);
  let errorMessage = ErrorMessages[errorType];

  // Gestion spécifique des erreurs Django
  if (error.response?.data) {
    const djangoError = error.response.data;
    
    if (djangoError.detail) {
      errorMessage = djangoError.detail;
    } else if (djangoError.non_field_errors) {
      errorMessage = djangoError.non_field_errors.join(', ');
    } else if (typeof djangoError === 'object') {
      errorMessage = formatDjangoErrors(djangoError);
    }
  }

  // Afficher le message d'erreur
  message.error(errorMessage);

  // Journalisation de l'erreur
  console.error('[Error Handler]:', {
    type: errorType,
    message: errorMessage,
    details: error.response?.data,
    stack: error.stack,
  });

  // Gérer les cas spéciaux
  if (errorType === ErrorTypes.AUTH_ERROR) {
    localStorage.clear();
    window.location.href = '/login';
  }

  return { type: errorType, message: errorMessage };
};

// Hook personnalisé pour la gestion des erreurs dans les composants
export const useErrorHandler = () => {
  return {
    handleError: (error, customMessage) => {
      const { type, message: errorMessage } = handleError(error);
      if (customMessage) {
        message.error(customMessage);
      }
      return { type, message: errorMessage };
    },
  };
}; 