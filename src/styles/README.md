# Guide d'utilisation du système de design

Ce dossier contient le nouveau système de design centralisé pour l'application FLI Frontend.

## Fichiers disponibles

### `designTokens.js`
Contient toutes les variables de design (couleurs, typographie, espacements, etc.)

### `uiUtils.js`
Contient les utilitaires UI, styles communs et configuration Ant Design

## Comment utiliser le système de design

### 1. Import des tokens de design
```javascript
import { colors, typography, spacing } from '../styles/designTokens';
```

### 2. Import des utilitaires UI
```javascript
import { styles, getStatusStyle, getRoleStyle, antdTheme } from '../styles/uiUtils';
```

### 3. Utilisation dans les composants

#### Couleurs
```javascript
// Couleurs primaires
const primaryColor = colors.primary.main; // #0a2a55
const highlightColor = colors.primary.highlight; // #00b7ff

// Couleurs de statut
const successColor = colors.status.success; // #28a745
const errorColor = colors.status.error; // #dc3545

// Couleurs de rôles
const studentColor = colors.roles.student; // #0088FE
const teacherColor = colors.roles.teacher; // #28a745
```

#### Styles communs
```javascript
// Conteneurs
<div style={styles.pageContainer}>
  <div style={styles.contentCard}>
    <h1 style={styles.pageTitle}>Titre de la page</h1>
  </div>
</div>

// Boutons
<button style={styles.primaryButton}>Bouton principal</button>
<button style={styles.secondaryButton}>Bouton secondaire</button>
<button style={styles.dangerButton}>Bouton danger</button>
```

#### Styles dynamiques
```javascript
// Style basé sur le statut
const statusStyle = getStatusStyle('present'); // Retourne un style vert
const statusStyle2 = getStatusStyle('absent'); // Retourne un style rouge

// Style basé sur le rôle
const roleStyle = getRoleStyle('etudiant'); // Retourne un style bleu
const roleStyle2 = getRoleStyle('professeur'); // Retourne un style vert
```

#### Configuration Ant Design
```javascript
import { ConfigProvider } from 'antd';
import { antdTheme } from '../styles/uiUtils';

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      {/* Vos composants Ant Design */}
    </ConfigProvider>
  );
}
```

## Avantages du système centralisé

1. **Cohérence** : Tous les composants utilisent les mêmes couleurs et styles
2. **Maintenabilité** : Changement global possible en modifiant un seul fichier
3. **Performance** : Pas de CSS redondant, styles optimisés
4. **Flexibilité** : Facile d'ajouter de nouveaux tokens ou styles
5. **Accessibilité** : Couleurs et contrastes standardisés

## Migration depuis l'ancien système

Les anciens fichiers CSS spécifiques aux pages ont été supprimés. Pour migrer :

1. Remplacez les classes CSS personnalisées par les styles du système
2. Utilisez les tokens de couleur au lieu de valeurs codées en dur
3. Adoptez les composants Ant Design avec notre thème personnalisé

## Exemple de migration

### Avant (avec CSS personnalisé)
```css
.my-button {
  background-color: #0a2a55;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}
```

### Après (avec le système de design)
```javascript
import { styles } from '../styles/uiUtils';

<button style={styles.primaryButton}>Mon bouton</button>
```

## Support et maintenance

Ce système de design est maintenu centralement. Pour toute modification :
1. Modifiez les tokens dans `designTokens.js`
2. Ajoutez de nouveaux styles dans `uiUtils.js`
3. Testez sur tous les composants avant déploiement
