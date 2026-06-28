# =========================================================================
# ClimbBeta API — imagem Docker multi-stage (Spring Boot / Kotlin)
# =========================================================================

# ---- Stage 1: build (compila o Kotlin e gera o .jar) --------------------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copia primeiro o wrapper + ficheiros de build (melhor cache de camadas)
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle

# O gradlew é um script shell: normaliza eventuais fins de linha do Windows (CRLF)
# e torna-o executável, senão falha num container Linux.
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Copia o código-fonte e empacota (bootJar NÃO corre testes -> não precisa de BD)
COPY src ./src
RUN ./gradlew bootJar --no-daemon

# ---- Stage 2: runtime (só o JRE + o jar) --------------------------------
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Copia o jar gerado (glob evita depender do nome/versão exata)
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
