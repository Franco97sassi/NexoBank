package com.nexobank.backend.domain.account;

import com.nexobank.backend.domain.account.dto.AccountPageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class AccountControllerTest {
    private AccountService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        service = mock(AccountService.class);
        mvc = standaloneSetup(new AccountController(service)).build();
    }

    @Test
    void listsAccountsUsingRequestedPagination() throws Exception {
        when(service.findAll("ada", 1, 20, "alias", org.springframework.data.domain.Sort.Direction.ASC))
                .thenReturn(new AccountPageResponse(List.of(), 1, 20, 0, 0));

        mvc.perform(get("/api/v1/accounts").param("search", "ada").param("page", "1")
                        .param("size", "20").param("sortBy", "alias").param("direction", "ASC"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.size").value(20));
        verify(service).findAll("ada", 1, 20, "alias", org.springframework.data.domain.Sort.Direction.ASC);
    }
}
