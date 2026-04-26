package com.climbbeta.api.config

import com.climbbeta.api.pipeline.AuthenticationInterceptor
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig(
    private val authenticationInterceptor: AuthenticationInterceptor
) : WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(authenticationInterceptor)
            .addPathPatterns("/**") // O Segurança vigia TODAS as rotas...
            .excludePathPatterns(   // ... EXCETO estas!
                "/users/register",
                "/users/login",
                "/error"
            )
    }

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**") // Permite todas as rotas da nossa API
            .allowedOrigins(
                "http://localhost:5173", // O teu projeto Web (Dashboard Owner)
                "http://localhost:3000", // Outras portas comuns
                "http://localhost:8081"  // O teu Expo Web (App Mobile no Browser) - AQUI ESTÁ A CORREÇÃO!
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Permite estes verbos
            .allowedHeaders("*") // Permite enviar o nosso cabeçalho de Authorization
            .allowCredentials(true) // Fundamental para a Fase de Cookies (Ticket 3E/1D)!
    }
}