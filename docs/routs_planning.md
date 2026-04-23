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

### `[Frontend Mobile] Ticket 3D: UI do Logbook`
**🚨 BLOQUEIO:** *Precisa da App base (3B) e da API de Ascents (3C).*
**Descrição:** O formulário no telemóvel para registar a subida.
**🛠️ Tarefas:**
- [ ] Criar ecrã de Log (Escolher Tries, Flash/Redpoint, Data).
- [ ] Ligar botão guardar ao `POST /ascents`.
- [ ] Ecrã de perfil para ver o histórico pessoal (`GET /ascents/me`).

---

## 💬 FASE 4: Comunidade, Media e Gamificação
*Transformar a App numa Rede Social.*

> **🚀 Trabalho em Paralelo:** O **Dev A** faz as tabelas M:N da Gamificação (Likes/Saves), o **Dev B** faz as tabelas Sociais (Follows/Feed). Ficheiros diferentes, avanço brutal.

### `[Backend] Ticket 4A: Fluxo de Aprovação de Gym Owners`
**Descrição:** Impedir que utilizadores recém-registados como `GYM_OWNER` comecem a criar ginásios sem validação prévia da plataforma.
**🔗 Endpoints Associados:**
- `PUT /admin/users/{id}/status` (Aprovar/Rejeitar)
**🛠️ Tarefas:**
- [ ] Adicionar coluna `account_status` (PENDING, ACTIVE, REJECTED) à tabela `users` (Default `ACTIVE` para Climbers, `PENDING` para Owners).
- [ ] Atualizar o `POST /users/register` para atribuir o status correto consoante a `role`.
- [ ] Atualizar os serviços de Ginásios (`POST /gyms`) para bloquear a criação se o `ownerId` tiver status `PENDING`.
- [ ] (Opcional) Criar endpoint básico de Admin para listar contas pendentes e aprovar.

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

