package com.nexobank.backend.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI nexoBankOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("NexoBank API")
                        .version("v1")
                        .description("API REST para la plataforma bancaria NexoBank")
                        .license(new License().name("Uso educativo")))
                .addServersItem(new Server().url("/").description("Servidor actual"))
                .components(new Components().addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                        .name(BEARER_AUTH)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT de acceso obtenido desde /api/v1/auth/login")));
    }
}
