# Runbook: Deploy da API no Raspberry Pi & Migração de Base de Dados

**Objetivo:** substituir a execução local do Spring Boot (no PC) por uma execução **nativa no
Raspberry Pi**, a consumir a rede Cloudflare, e migrar os dados antigos para os novos URLs públicos.

---

## Fase 1 — Sincronização do Repositório (Git)
Para garantir que o servidor tem o código de produção exato:
1. Fechámos a branch de testes (`goncalo-testing`), selando os novos endpoints e variáveis de ambiente (`.env` e `api.ts`).
2. `git merge` para a branch `main`.
3. No Raspberry Pi (via MobaXterm), clonámos o repositório para a diretoria do utilizador (`/home/koro/ClimbBeta`).

## Fase 2 — Compilação Nativa (Build)
Em vez de delegar a compilação ao Portainer (que causaria problemas de caminho/contexto), a imagem
Docker foi compilada **diretamente no terminal do servidor**:
1. `cd ~/ClimbBeta/backend`
2. Compilar a imagem:
   ```bash
   docker build -t climbbeta-api:latest .
   ```
   > Usa o `Dockerfile` da pasta, descarrega o JDK, compila o Kotlin via Gradle e cria uma imagem
   > Docker local rotulada como `latest`. (Build nativo **arm64**, na arquitetura do próprio RPi.)

## Fase 3 — Integração no Portainer
Com a imagem local pronta, orquestrámos o serviço junto à infraestrutura existente
(PostgreSQL, MinIO e Cloudflared):
1. No editor da stack, adicionámos o bloco da API:
   ```yaml
     api:
       image: climbbeta-api:latest
       container_name: climbbeta-api
       restart: unless-stopped
       network_mode: host
       pull_policy: never
   ```
   > **Correção crítica (`pull_policy: never`):** sem isto, o Docker ignorava a imagem compilada
   > localmente e procurava no Docker Hub → erro "Access Denied". O `never` força a execução do
   > pacote nativo que está no disco do RPi.
2. Desativámos a opção **"Re-pull image and redeploy"** e atualizámos a stack.
3. **Resultado:** o `502 Bad Gateway` da Cloudflare desapareceu, dando lugar a um **`401 Unauthorized`**
   esperado em `/feed` — sinal de que a API está viva e com a segurança ativa.

## Fase 4 — Migração de Dados (URLs antigos)
Os registos antigos da BD referenciavam o IP local (`http://192.168.1.64:9000`), impossibilitando a
renderização de media fora da LAN.
1. Acedemos ao cliente SQL (pgAdmin).
2. Executámos `UPDATE` com substituição de string, em cada tabela com URLs de media:
   ```sql
   UPDATE media            SET media_url       = REPLACE(media_url,       'http://192.168.1.64:9000', 'https://media.climbbetaapp.xyz') WHERE media_url       LIKE 'http://192.168.1.64:9000%';
   UPDATE boulders         SET image_url       = REPLACE(image_url,       'http://192.168.1.64:9000', 'https://media.climbbetaapp.xyz') WHERE image_url       LIKE 'http://192.168.1.64:9000%';
   UPDATE gyms             SET cover_image_url = REPLACE(cover_image_url, 'http://192.168.1.64:9000', 'https://media.climbbetaapp.xyz') WHERE cover_image_url LIKE 'http://192.168.1.64:9000%';
   UPDATE climber_profiles SET avatar_url      = REPLACE(avatar_url,      'http://192.168.1.64:9000', 'https://media.climbbetaapp.xyz') WHERE avatar_url      LIKE 'http://192.168.1.64:9000%';
   ```
3. **Resultado:** todos os assets de media (históricos e futuros) apontam para o túnel Cloudflare,
   unificando o acesso em qualquer rede.

---

## Verificação & estado atual
- **Testado em 4G:** com `npx expo start -c --tunnel`, a app abre no telemóvel em **dados móveis** e as
  fotos carregam de `https://media.climbbetaapp.xyz`. Backend + storage **públicos e validados**. ✅
- **Nota sobre o `--tunnel`:** o `--tunnel` torna o *bundle* do Metro (que corre no PC) acessível pela
  internet, por isso o PC tem de estar ligado durante o teste. Para a app abrir **sem o PC** (qualquer
  pessoa, por QR), falta o **Expo EAS** (`eas update`/`eas build`) — Fase 7.

## Pendentes (próximas fases)
- **Web Dashboard (Cloudflare Pages):** adicionar a origem pública (ex.: `https://climbbetaapp.xyz`)
  ao CORS em `WebConfig.kt` **antes** de publicar (senão o browser bloqueia as chamadas), recompilar a
  imagem da API no RPi, e lançar o frontend Vite na Cloudflare Pages.
- **Distribuição mobile (Expo EAS):** `eas update`/`eas build` para a app ser acessível por QR sem o PC.
