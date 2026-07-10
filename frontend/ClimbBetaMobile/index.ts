/**
 * @file index.ts
 * @description Entrypoint para a bundling do app mobile (ex.: registro do componente principal).
 *
 * Observações:
 *  - Normalmente controlado pelo Expo; evitar lógica extra.
 */
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
