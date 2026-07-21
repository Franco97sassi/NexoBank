package com.nexobank.backend.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI nexoBankOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("NexoBank API")
                        .version("v1")
                        .description("API REST para la plataforma bancaria NexoBank"));
    }
}
