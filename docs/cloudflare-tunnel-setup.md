# Deploy na Cloud — Cloudflare Tunnel (Tarefa 5, Fases 1–4)

Como expor a API (Spring Boot) e o MinIO (fotos) do Raspberry Pi à internet pública
(`climbbetaapp.xyz`) **sem abrir portas no router de casa**, usando um túnel inverso da Cloudflare.

---

## Fase 1 — Aquisição de Domínio e Gestão de DNS
**Objetivo:** ter um endereço público (`climbbetaapp.xyz`) e dar o controlo do tráfego à Cloudflare.

1. **Comprar o domínio (Porkbun):** um `.xyz` (barato), sem extras de alojamento.
   - **Segurança/custo:** desligado o *Auto-Renew* para não haver cobrança no 2º ano.
   - **Lição (estado do registo):** códigos como `clientTransferProhibited` e `clientDeleteProhibited`
     **não são erros** — são fechaduras de segurança nativas da ICANN para evitar roubo do domínio.
2. **Ligar à Cloudflare:** plano **Free** → *Connect a domain*.
   - **Aviso de DNS:** a Cloudflare avisa que "faltam registos DNS". O correto é **ignorar e clicar
     em "Add records later"** — o Zero Trust cria-os automaticamente.
3. **Mudar os Nameservers:** a Cloudflare gera 2 nameservers (ex.: `alice.ns.cloudflare.com`).
   No Porkbun, **apagar os 4 nativos** e colar **apenas os 2 da Cloudflare**.
   - O estado fica **"Pending"**; a propagação demora ~10 min a 1 h (durante esse tempo a Cloudflare
     pode mostrar "Invalid Nameservers" — é temporário).

## Fase 2 — Criar o Túnel Inverso (Zero Trust)
**Objetivo:** uma conduta encriptada de **dentro** do RPi para a Cloudflare, sem abrir portas no router.

1. **Gerar o túnel:** Cloudflare → Zero Trust → Networks → Tunnels → criar túnel **Cloudflared** e
   copiar **apenas o Token** da secção de instalação para Docker.
2. **Instalar no RPi (Portainer):** na *Stack* onde já corriam o PostgreSQL e o MinIO, adicionar o
   serviço **`cloudflared`** (atenção redobrada à **indentação do YAML**, alinhada com os outros serviços).
   - **Configuração-chave:** `network_mode: host` (em vez de uma rede isolada) para o túnel aceder
     diretamente às portas do RPi.
3. **Validação:** na Cloudflare, o estado do túnel passa a **Connected**.

## Fase 3 — Roteamento (As Pontes)
**Objetivo:** dizer à Cloudflare para onde enviar quem escreve `api.` ou `media.` no browser.

No painel do Túnel → Configure → **Public Hostnames** (Published application routes):
- **Rota da API (Spring Boot):** Subdomain `api` → `http://192.168.1.64:8080`
- **Rota do MinIO (fotos):** Subdomain `media` → `http://192.168.1.64:9000`

> **Atenção:** usar o **IP físico** (`192.168.1.64`) em vez de `localhost`, para o túnel não se
> confundir com configurações IPv6 do contentor.

## Fase 4 — "Diagnóstico de Engenheiro" (lições vitais)
**Objetivo:** ler erros de rede sem entrar em pânico.

- **502 Bad Gateway (na API):**
  - *O que parece:* "está tudo partido."
  - *O que é mesmo:* **sucesso total da infraestrutura.** O domínio resolveu, desceu pelo túnel e
    bateu no RPi — só que o **contentor do Spring Boot ainda não estava a correr**.
- **"Site can't be reached" / Timeout (no MinIO):**
  - *O que parece:* "o túnel das fotos não funciona."
  - *O que é mesmo:* o MinIO tem **duas portas** — `9000` (API/App) e `9001` (painel web). Quando um
    **browser humano** acede à `9000`, o MinIO tenta **redirecionar** para a `9001`; como a Cloudflare
    só conhecia a `9000`, cortava a ligação.
  - *Como validámos:* mudámos temporariamente a rota para `192.168.1.64:9001`, testámos no **4G** do
    telemóvel e o painel de login apareceu → prova de que a rede estava perfeita. Repusemos para a
    `9000` (a porta que a App React Native precisa para **ler as fotos** sem redirecionamentos).

---

## 📌 Notas técnicas / próximos passos
1. **Resolver o 502:** falta correr o contentor do Spring Boot no RPi (finalizar a Fase 4 da Tarefa 4).
   Assim que o `climbbeta-api` arrancar, `https://api.climbbetaapp.xyz` deixa de dar 502.
2. **`minio.public-url` (CRÍTICO):** depois do túnel, o `application.properties` tem de passar a
   `minio.public-url=https://media.climbbetaapp.xyz` — senão os URLs das fotos gravados na BD continuam
   `http://192.168.1.64:9000/...` (só acessível na LAN, partido para utilizadores externos).
   *(Pode ser preciso um find-replace nos URLs já gravados, como se fez na revisão de IP local.)*
3. **CORS (fase do dashboard web):** quando a web for para a Cloudflare Pages, o `WebConfig.kt` tem de
   autorizar a origem pública (`https://...pages.dev` ou `https://climbbetaapp.xyz`).
4. **Renovação do domínio:** com o *Auto-Renew* desligado, garantir que o domínio não expira antes da
   defesa (11/jul).
