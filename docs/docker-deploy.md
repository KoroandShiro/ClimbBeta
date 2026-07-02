# Dockerização da API (Tarefa 4 / Fase 4)

Guia para empacotar a API ClimbBeta (Spring Boot / Kotlin) numa imagem Docker e correr
o container — quer localmente (PC) quer no Raspberry Pi.

## 🎯 Objetivo
Empacotar a API numa **imagem Docker portável e reproduzível** que compile o `.jar` e o corra
sozinha, para fazer deploy no Raspberry Pi (via Portainer) sem depender do ambiente de
desenvolvimento.

## 🧠 Conceitos-chave
- **Multi-stage build:** o *stage 1* usa um **JDK** (pesado) só para compilar; o *stage 2* usa um
  **JRE** (leve) e leva apenas o `.jar`. A imagem final não carrega o JDK nem o código-fonte →
  mais pequena e com menor superfície de ataque.
- **`.dockerignore`:** evita copiar `build/`, `.gradle/`, etc. para o contexto de build (mais
  rápido e limpo).
- **Configuração *baked*:** a `application.properties` já aponta para o RPi (`192.168.1.64`),
  por isso o container liga-se à BD/MinIO **sem variáveis de ambiente**. É uma decisão consciente
  de simplicidade para um único RPi (sem over-engineering). O único valor que muda na fase de
  Cloudflare é o `minio.public-url`.

## 📁 Ficheiros

### `backend/Dockerfile`
```dockerfile
# Stage 1 — build: compila o Kotlin e gera o .jar
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew   # corrige fins de linha do Windows (CRLF)
COPY src ./src
RUN ./gradlew bootJar --no-daemon                  # bootJar NÃO corre testes -> não precisa de BD

# Stage 2 — runtime: só o JRE + o jar
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### `backend/.dockerignore`
Inclui `build/`, `.gradle/`, `bin/`, `.idea/`, `*.iml`, `requests/`, `*.md`, etc.

## 📝 Passo-a-passo

**1) Construir a imagem** (a partir da pasta `backend/`):
```bash
docker build -t climbbeta-api .
```

**2) Testar localmente** (no PC, contra a BD/MinIO do RPi):
```bash
docker run -d --name climbbeta-api-test -p 8080:8080 climbbeta-api
# espera ~5s pelo arranque do Spring Boot, depois testa (usa Git Bash, ver tropeção #3):
curl -s -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"koro@gmail.com","passwordRaw":"demo1234"}'
```

**3) Limpar o container de teste:**
```bash
docker stop climbbeta-api-test
docker rm climbbeta-api-test
```

**4) Deploy no Raspberry Pi (ARM64):** como o PC é **amd64** e o RPi é **arm64**, a imagem
constrói-se no próprio RPi.

> **Método final (autoritativo): ver [rpi-deploy-runbook.md](rpi-deploy-runbook.md).** Na prática o
> Portainer **não** consegue usar `build: .` (não acede ao contexto da pasta). Por isso compila-se a
> imagem no terminal (`docker build -t climbbeta-api:latest .`) e no Portainer usa-se `image:
> climbbeta-api:latest` + `pull_policy: never`. O bloco abaixo é apenas ilustrativo do plano inicial.

No Portainer, criar um *stack*:
```yaml
services:
  api:
    build: .              # git pull do repo primeiro; constrói no RPi (~3-5 min)
    container_name: climbbeta-api
    restart: always
    network_mode: host    # partilha a rede do RPi -> alcança 192.168.1.64:5432 / :9000
```

## ⚠️ Tropeções (e como evitar)
1. **`gradlew` com CRLF** (Windows → Linux): falha num container Linux.
   *Fix:* `sed -i 's/\r$//' gradlew` no Dockerfile (já incluído).
2. **Docker Desktop tem de estar a correr** (o motor Linux), senão o `docker build` nem liga ao daemon.
3. **PowerShell estraga as aspas** do JSON ao chamar `curl.exe` → erro "Malformed JSON request body".
   *Fix:* usar **Git Bash** para testes de `curl` com corpo JSON.
4. **amd64 (PC) ≠ arm64 (Pi):** construir a imagem no próprio RPi (ou `docker buildx build --platform linux/arm64`).

## ✅ Verificação
- `docker build` conclui com `BUILD SUCCESSFUL` e gera o `app.jar`.
- `docker run -p 8080:8080` + `GET /feed` (com token) devolve o feed semeado → o container arranca
  e fala com a BD/MinIO do RPi.
