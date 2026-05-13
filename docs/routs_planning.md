Ficheiro temporário feito com ajuda de AI para ajudar a organizar as tarefas do projeto. O objetivo é ter uma visão clara das fases, tickets e dependências para que a equipa possa trabalhar de forma eficiente e paralela.
Mudar o conteúdo deste ficheiro é crucial conforme o projeto avança, para refletir o progresso e as mudanças de prioridades.
# 📋 ClimbBeta - GitHub Project Board (Tickets)

## 🧱 FASE 1: Identidade e Segurança (Users & Profiles)
*O motor de acesso à plataforma.*

> **🚀 Trabalho em Paralelo:** Nesta fase, o **Dev A** pode pegar no Ticket 1A (Tokens) enquanto o **Dev B** pega no Ticket 1B (Profiles). Tocam em ficheiros e tabelas diferentes, zero conflitos!

### `[Backend] Ticket 1A: Implementar Login e Geração de Token`
**Descrição:** Permitir que um utilizador registado consiga entrar e receber um Token de sessão gerado aleatoriamente.
**🔗 Endpoints Associados:** - `POST /users/login`
**🛠️ Tarefas:**
- [ ] Criar entidade `Token.kt` no domínio.
- [ ] Criar `TokenRepository.kt` e a implementação `JdbiTokenRepository.kt` (com `INSERT`).
- [ ] No `UserService`, criar a função `login(email, password)` que valida a pass e gera a *string* aleatória.
- [ ] No `UserController`, criar a rota que devolve o token ao cliente.

### `[Backend] Ticket 1B: Criação e Gestão de Perfis Físicos`
**Descrição:** Ao registar, o sistema deve criar automaticamente um perfil vazio. Adicionar também rotas para consultar e editar esse perfil.
**🔗 Endpoints Associados:** - `POST /users/register` (Atualizar o código existente)
- `GET /profiles/me`
- `PUT /profiles/me`
- `GET /profiles/{id}`
**🛠️ Tarefas:**
- [ ] Criar as entidades `ClimberProfile.kt` e `GymOwnerProfile.kt`.
- [ ] No `JdbiUserRepository.kt` (registo), adicionar execução para fazer o `INSERT INTO climber_profiles/gym_owner_profiles`.
- [ ] Criar `ProfileController.kt` e os métodos GET e PUT para os endpoints acima listados.

### `[Backend] Ticket 1C: Interceptor de Autenticação global`
**🚨 BLOQUEIO:** *Este ticket só pode ser iniciado depois do Ticket 1A estar concluído (precisa do TokenRepository).*
**Descrição:** Proteger a API. Todas as rotas (exceto login/register) passam a exigir um Token válido no cabeçalho.
**🔗 Endpoints Associados:** Afeta todas as rotas futuras.
**🛠️ Tarefas:**
- [ ] Criar `AuthenticationInterceptor.kt` (ver exemplo do WaveCoach na pasta `pipeline`).
- [ ] Ler o *header* `Authorization: Bearer <token>`.
- [ ] Validar na BD se o token existe e injetar o `User` no request. Devolver `401 Unauthorized` se falhar.

---

## 🏢 FASE 2: Infraestrutura Indoor (Gyms & Boulders)
*O Backoffice Web e catálogo de ginásios.*

> **🚀 Trabalho em Paralelo:** O **Dev A** ataca o Backend dos Ginásios (Ticket 2A), enquanto o **Dev B** arranca com o projeto React na Web (Ticket 2B).

### `[Backend] Ticket 2A: CRUD Base de Ginásios`
**Descrição:** Permitir criar e listar ginásios (apenas Admins criam, Owners editam, todos veem).
**🔗 Endpoints Associados:** - `POST /gyms`
- `GET /gyms`
- `GET /gyms/{id}`
- `PUT /gyms/{id}`
**🛠️ Tarefas:**
- [ ] Criar entidade `Gym.kt`.
- [ ] Criar `JdbiGymRepository.kt` com as queries base.
- [ ] Criar `GymServices.kt` com validações de permissões (só Admin/Owner).
- [ ] Criar `GymController.kt` com as rotas.

### `[Frontend Web] Ticket 2B: Setup React e Ecrã de Login`
**Descrição:** Iniciar o portal Web para gestão dos ginásios.
**🔗 Endpoints Associados:** Consome o `POST /users/login`.
**🛠️ Tarefas:**
- [ ] Setup do projeto React (ex: Vite + React).
- [ ] Criar ecrã de Login simples.
- [ ] Fazer chamada à API e guardar o token (LocalStorage/Context).

### `[Backend] Ticket 2C: Gestão de Vias (Boulders)`
**🚨 BLOQUEIO:** *Precisa que o Ticket 2A esteja feito (não há boulders sem ginásios).*
**Descrição:** Donos de ginásios podem adicionar vias novas ou marcá-las como inativas.
**🔗 Endpoints Associados:** - `POST /gyms/{id}/boulders`
- `GET /gyms/{id}/boulders`
- `PUT /boulders/{id}/status`
**🛠️ Tarefas:**
- [ ] Criar entidade `Boulder.kt`.
- [ ] Criar repositório e controller para inserir e listar vias de um ginásio.
- [ ] Implementar o *Soft Delete* (mudar `is_active` para false na rota PUT).

### `[Frontend Web] Ticket 2D: Dashboard do Owner (Vias)`
**🚨 BLOQUEIO:** *Precisa do 2B (React criado) e 2C (Rotas feitas).*
**Descrição:** UI para o dono do ginásio ver a tabela de vias e adicionar novas.
**🛠️ Tarefas:**
- [ ] Criar ecrã de detalhe do Ginásio.
- [ ] Consumir GET e desenhar tabela de vias.
- [ ] Criar formulário (Modal) para adicionar nova via e ligar ao POST.

---

## 🧗‍♂️ FASE 3: Logbook Core (Ascents & Outdoor)
*O coração da aplicação Mobile.*

> **🚀 Trabalho em Paralelo:** O **Dev A** arranca no React Native (Mobile - Ticket 3B) para consumir ginásios, enquanto o **Dev B** constrói o monstro do Backend do Logbook (Tickets 3A e 3C).

### `[Backend] Ticket 3A: Ecossistema Outdoor`
**Descrição:** Permitir registar e listar rochas na natureza.
**🔗 Endpoints Associados:** - `POST /outdoor-routes`
- `GET /outdoor-routes`
**🛠️ Tarefas:**
- [ ] Criar `OutdoorRoute.kt` e respetivos repositórios/controladores.

### `[Frontend Mobile] Ticket 3B: Setup React Native e Ecrã Explore`
**Descrição:** Iniciar a App mobile dos escaladores e ligar ao catálogo indoor.
**🔗 Endpoints Associados:** Consome `GET /gyms` e `GET /gyms/{id}/boulders`.
**🛠️ Tarefas:**
- [ ] Criar UI de navegação base (Tabs).
- [ ] Ecrã "Explore": listar ginásios consumindo a API.
- [ ] Ao clicar num ginásio, mostrar lista de Boulders ativos.

### `[Backend] Ticket 3C: O Super-Endpoint (Logbook Ascents)`
**🚨 BLOQUEIO:** *Precisa que a Fase 2 (Boulders) e o Ticket 3A (Outdoor) estejam prontos na BD.*
**Descrição:** Inserir e consultar subidas. A query tem de ser flexível para Indoor, Outdoor ou Livre.
**🔗 Endpoints Associados:** - `POST /ascents`
- `GET /ascents/me`
- `GET /ascents/{id}`
- `DELETE /ascents/{id}`
**🛠️ Tarefas:**
- [ ] Criar `Ascent.kt` e o `JdbiAscentRepository.kt`.
- [ ] Tratar a lógica: se vier `boulder_id`, é indoor; se vier `outdoor_route_id`, é outdoor.
- [ ] Desenvolver as rotas de GET e DELETE.

### `[Frontend Mobile] Ticket 3D: UI do Logbook (O Questionário de Ascents)`
**Descrição:** Substituir a navegação hardcoded atual pelo formulário real onde o escalador regista a sua subida.
**🔗 Endpoints:** Consome o `POST /ascents` (O Super-Endpoint).
**🛠️ Tarefas:**
- [ ] Criar modal/ecrã de registo ao clicar num Boulder.
- [ ] Formulário com: Data, Tentativas, Estilo (Flash/Redpoint/Project) e Notas.
- [ ] Ligar botão "Gravar" à API e mostrar mensagem de sucesso.

### `[Frontend Web] Ticket 3E: Dashboard do Owner & Persistência`
**Descrição:** A "casa" do dono do ginásio no browser.
**🔗 Endpoints:** Consome `GET /gyms`, `PUT /gyms/{id}`.
**🛠️ Tarefas:**
- [ ] Configurar Cookies/LocalStorage no Vite para o Owner não perder o login no refresh.
- [ ] Criar página principal que lista os ginásios do Owner logado.
- [ ] Criar ecrã/modal de "Criar Ginásio" (liga ao `POST /gyms`).
- [ ] Formulário para editar dados do ginásio (Morada, Imagem de Capa).

### `[Frontend Mobile] Ticket 3F: Ecrãs de Autenticação Reais`
**Descrição:** Remover o login automático (`dev_email`) e criar as portas de entrada da App.
**🔗 Endpoints:** Consome `POST /users/login` e `POST /users/register`.
**🛠️ Tarefas:**
- [ ] Criar ecrã de Login e de Registo.
- [ ] Guardar o Token de forma segura no telemóvel (`Expo SecureStore`).
- [ ] Criar lógica de "Auto-Login" (se já tiver token válido, salta direto para o Explore).

### `[Frontend Mobile] Ticket 3G: Exploração Outdoor (Mapa e Filtros)`
**Descrição:** Interface para a comunidade ver e adicionar rochas na natureza. Crucial: Evitar rochas duplicadas!
**🔗 Endpoints:** Consome `GET /outdoor-routes` e `POST /outdoor-routes`.
**🛠️ Tarefas:**
- [ ] Criar separador "Outdoor" com um Mapa (ou lista com barra de pesquisa/filtros por localização).
- [ ] Lógica visual: Antes de poder criar uma rocha, o utilizador *tem* de pesquisar no mapa se ela já existe.
- [ ] Criar formulário de submissão de nova Rocha (`POST`).
---

## 💬 FASE 4: Comunidade, Media e Gamificação
*Transformar a App numa Rede Social.*

> **🚀 Trabalho em Paralelo:** O **Dev A** faz as tabelas M:N da Gamificação (Likes/Saves), o **Dev B** faz as tabelas Sociais (Follows/Feed). Ficheiros diferentes, avanço brutal.

### `[Backend] Ticket 4A: O Gatekeeper (Códigos de Ativação VIP)`
**Descrição:** Um Gym Owner pode criar conta livremente, mas o seu `status` fica como `PENDING`. Para criar ginásios, precisa de inserir um código único gerado pelo Admin (tu).
**🔗 Endpoints Associados:** `POST /admin/codes`, `POST /users/verify-code`.
**🛠️ Tarefas:**
- [ ] Criar tabela `activation_codes` (code, is_used).
- [ ] Adicionar coluna `status` (PENDING / VERIFIED) à tabela `users`.
- [ ] Criar endpoint onde o Admin gera os códigos.
- [ ] Criar endpoint onde o Owner submete o código (se válido, passa a VERIFIED).
- [ ] Bloquear o `POST /gyms`: Só Owners VERIFIED podem criar ginásios.

### `[Backend] Ticket 4B: Interações Sociais e Feed`
**🔗 Endpoints Associados:** - `POST /climbers/{id}/follow`
- `DELETE /climbers/{id}/follow`
- `GET /feed`
**🛠️ Tarefas:**
- [ ] Fazer os INSERTs/DELETEs na tabela `follows_climber`.
- [ ] A query do terror (Feed): Juntar `ascents` aos `climbers` que o user segue e ordenar por data.

### `[Backend] Ticket 4C: Gamificação (Likes, Saves e Leaderboard)`
**🔗 Endpoints Associados:** - `POST /ascents/{id}/like`
- `POST /boulders/{id}/save`
- `GET /projects/me`
- `GET /boulders/{id}/leaderboard`
**🛠️ Tarefas:**
- [ ] Inserir os likes e saves nas respetivas tabelas M:N.
- [ ] Construir a query SQL do Leaderboard (agrupar `ascents` de um boulder, ordenar por flash e número de tentativas).

### `[Backend] Ticket 4D: Comentários e Media (Vídeos)`
**🔗 Endpoints Associados:** - `POST /ascents/{id}/comments`
- `POST /media`
**🛠️ Tarefas:**
- [ ] Guardar comentários nas subidas.
- [ ] Guardar links de vídeos (Beta) e ligar a boulders ou ascents.

### `[Frontend Mobile] Ticket 4E: Integrar Social na App`
**🚨 BLOQUEIO:** *Depende das APIs da Fase 4 estarem feitas.*
**🛠️ Tarefas:**
- [ ] Criar o Ecrã "Home" e consumir o `GET /feed`.
- [ ] Botão de Like nas subidas do feed.
- [ ] Adicionar separador "Leaderboard" no detalhe do Boulder.

### `[Frontend Web] Ticket 4F: O Painel do Admin e Bloqueio do Owner`
**Descrição:** O reflexo do Ticket 4A no Frontend. O Admin tem o seu painel de controlo, e o Owner bloqueado vê uma página a pedir o código.
**🛠️ Tarefas:**
- [ ] **Visão Owner:** Se o Owner logado for `PENDING`, a Dashboard Web não mostra ginásios, mostra apenas uma "Parede de Bloqueio" a pedir o "Código de Ativação".
- [ ] **Visão Admin:** Ecrã exclusivo (ROLE_ADMIN) com um botão mágico: "Gerar Novo Código" e uma lista de códigos já gerados.

### `[Frontend Mobile] Ticket 4G: Perfil do Escalador`
**Descrição:** Onde o escalador vê as suas estatísticas e pode fazer logout.
**🔗 Endpoints:** Consome `GET /ascents/me` e `GET /profiles/me`.
**🛠️ Tarefas:**
- [ ] Criar tab "Perfil" na navegação.
- [ ] Mostrar Logbook visual com histórico de subidas.
- [ ] Botão de Logout (Limpa o SecureStore e volta ao Login).

---

## 🛡️ FASE 5: Polimento para Defesa
*Entregar um projeto imaculado aos professores.*

### `[Fullstack] Ticket 5A: Tratamento Global de Erros`
**Descrição:** Impedir que o Spring devolva HTML feio quando falha.
**🛠️ Tarefas:**
- [ ] Criar `@ControllerAdvice` para apanhar `Exception` e devolver JSON tipo `{"error": "Mensagem"}`.

### `[Backend] Ticket 5B: Script de Test Data (Seeding)`
**Descrição:** Para a defesa, a app não pode estar vazia.
**🛠️ Tarefas:**
- [ ] Criar um script `insert-test-data.sql` que enche a BD com 3 users, 2 ginásios, 15 boulders e 30 ascents.

***

