package com.climbbeta.api.config

import com.climbbeta.api.pipeline.AuthenticationInterceptor
import org.springframework.context.annotation.Configuration
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
}