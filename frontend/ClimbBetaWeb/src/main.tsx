/**
 * @file main.tsx
 * @description Entrada da aplicação web — cria o root React e renderiza o `App`.
 *
 * Uso:
 *  - É o ponto de bootstrap do Vite. Não deve conter lógica de negócio.
 *
 * Nota:
 *  - Alterações aqui podem afetar todo o ciclo de inicialização (e.g. providers globais).
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
