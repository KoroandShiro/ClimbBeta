package com.climbbeta.api.config

import com.climbbeta.api.pipeline.AuthenticationInterceptor
import com.climbbeta.api.pipeline.AuthorizationInterceptor
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig(
    private val authenticationInterceptor: AuthenticationInterceptor,
    private val authorizationInterceptor: AuthorizationInterceptor
) : WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        // Rotas públicas: ficam de fora dos DOIS interceptors (não exigem login nem role).
        val publicPaths = arrayOf(
            "/users/register",
            "/users/login",
            "/error",

            // === LIBERTAR O SWAGGER DA AUTENTICAÇÃO ===
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/v3/api-docs.yaml",
            "/swagger-ui.html"
        )

        // 1º) Autenticação: "quem és tu?" — valida o token e injeta o authenticatedUser.
        registry.addInterceptor(authenticationInterceptor)
            .addPathPatterns("/**")
            .excludePathPatterns(*publicPaths)

        // 2º) Autorização: "a tua role pode entrar nesta rota?" — corre DEPOIS, por isso o
        // authenticatedUser já está disponível. Lê a anotação @ProtectedRoute e devolve 403.
        registry.addInterceptor(authorizationInterceptor)
            .addPathPatterns("/**")
            .excludePathPatterns(*publicPaths)
    }

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**") // Permite todas as rotas da nossa API
            // Usamos allowedOriginPatterns (e NÃO allowedOrigins) porque precisamos de um wildcard
            // (https://*.pages.dev) e de o conjugar com allowCredentials(true). O allowedOrigins não
            // aceita padrões com '*', e '*' literal é proibido quando allowCredentials=true.
            .allowedOriginPatterns(
                // --- Desenvolvimento local ---
                "http://localhost:5173", // Dashboard Web (Vite)
                "http://localhost:3000", // Outras portas comuns
                "http://localhost:8081", // Expo Web (app no browser)
                // --- Produção (Cloudflare) ---
                "https://climbbetaapp.xyz",       // domínio principal
                "https://www.climbbetaapp.xyz",   // variante www
                "https://*.pages.dev"             // previews automáticos da Cloudflare Pages
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Verbos permitidos
            .allowedHeaders("*") // Permite o cabeçalho Authorization
            .allowCredentials(true) // Mantido
    }
}