# Runbook: Deploy do Dashboard Web e Distribuição Mobile (Fases 6 e 7)

**Objetivo:** publicar o frontend Web numa infraestrutura global (serverless) e preparar a app
Mobile para a demonstração final, ligando todos os clientes à API pública no Raspberry Pi.

---

## Fase 6 — Deploy do Web Dashboard na Cloudflare Pages

### Segurança / CORS
- O `WebConfig.kt` (Kotlin) foi atualizado para aceitar tráfego externo.
- Usou-se **`allowedOriginPatterns`** (em vez de `allowedOrigins`), contornando a regra do CORS que
  proíbe o wildcard `*` em conjunto com `allowCredentials(true)`. Foram autorizadas:
  `https://climbbetaapp.xyz`, `https://www.climbbetaapp.xyz` e os previews `https://*.pages.dev`.
- A imagem da API foi **reconstruída nativamente no RPi** e a stack atualizada no Portainer para
  injetar as novas regras.

### CI/CD na Cloudflare
- GitHub associado à Cloudflare Pages; *root directory* = `frontend/ClimbBetaWeb`,
  *build command* = `npm run build`, *output* = `dist`.
- **Incidente (build):** a Cloudflare (Linux) abortou no `npm ci` por incompatibilidade do
  `package-lock.json` gerado no Windows (faltava `@emnapi/runtime`).
  - **Resolução:** removeu-se o `package-lock.json` do repo → a Cloudflare passou a usar `npm install`
    (mais tolerante), deduzindo os binários certos para a arquitetura Linux.
- **Incidente (TypeScript):** `tsc -b` falhou com `TS6133: 'React' is declared but never read` em
  `AuthContext.tsx` (o `npm run dev` local não corre `tsc`, por isso o erro estava latente).
  - **Resolução:** removido o `import React` não usado (o JSX moderno dispensa-o).
- **Resultado:** site público, servido globalmente e a comunicar com o backend.

## Fase 7 — Distribuição Mobile (Expo)

### Tentativa: EAS Update
- `eas update:configure` para publicar o bundle JS na nuvem da Expo.
- **Incidente (403):** num dispositivo de terceiros, as regras de segurança da Expo bloquearam o
  acesso público ao código via Expo Go (exigem autenticação do dono do projeto).

### Plano de demonstração adotado: Túnel (ngrok)
- Ajustou-se a estratégia de apresentação para o **túnel dinâmico local**.
- **Erro de túnel** (`TypeError: Cannot read properties of undefined`) corrigido forçando a versão
  mais recente do cliente: `npm install -g @expo/ngrok@latest`.
- **Resultado:** `npx expo start -c --tunnel` gera um URL público temporário; qualquer avaliador que
  leia o QR Code no Expo Go carrega a app, que faz as chamadas à rede Cloudflare (prova a API pública).

---

## 📌 Notas para a defesa (robustez) — recomendações de engenharia
O túnel `--tunnel` funciona para a demo, mas convém teres consciência das suas limitações e de um
plano B:
1. **Depende do teu PC:** o `expo start --tunnel` é um servidor de desenvolvimento — o teu portátil
   tem de ficar **ligado, na rede e a correr o Metro** durante toda a defesa.
2. **URL efémero:** muda a cada reinício. **Arranca o túnel antes da demo e não o reinicies.**
3. **Depende do ngrok** (serviço externo gratuito) estar de pé.
4. **Alternativa mais sólida (se houver tempo):** `eas build --profile preview --platform android`
   gera um **APK instalável** — o júri instala diretamente, **sem Expo Go, sem o teu PC, sem ngrok**.
   (Android não precisa de conta Apple; é o caminho mais robusto e evita o 403 do Expo Go.)
5. **Plano B para o dia:** ter uma **gravação de ecrã** da app a funcionar, caso a rede/túnel falhe
   no momento.

## ⚠️ Nota de repositório
O `frontend/ClimbBetaWeb/package-lock.json` foi **removido de propósito** (para a Cloudflare usar
`npm install`). Se correres `npm install` na pasta web, ele é recriado localmente — **não o voltes a
commitar**, senão o build da Cloudflare volta a partir. Sugestão: adicionar
`frontend/ClimbBetaWeb/package-lock.json` ao `.gitignore`.
