package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.Token
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class JdbiTokenRepositoryTests:  JdbiRepositoryTestBase() {

    private val userRepo = JdbiUserRepository(jdbi)
    private val tokenRepo = JdbiTokenRepository(jdbi)


    @Test
    fun `createToken e getTokenByHash devem persistir e devolver token`() {
        val user = userRepo.createUser(
            User(
                username = "tokenUser",
                email = "token@test.com",
                passwordHash = "hash",
                role = UserRole.CLIMBER
            )
        )

        val token = Token(tokenHash = "token-123", userId = user.id)
        tokenRepo.createToken(token)

        val fetched = tokenRepo.getTokenByHash("token-123")
        assertNotNull(fetched)
        assertEquals(user.id, fetched!!.userId)
        assertNotNull(fetched.createdAt)
    }

    @Test
    fun `getTokenByHash deve devolver null quando token nao existe`() {
        assertNull(tokenRepo.getTokenByHash("no-token"))
    }


}
