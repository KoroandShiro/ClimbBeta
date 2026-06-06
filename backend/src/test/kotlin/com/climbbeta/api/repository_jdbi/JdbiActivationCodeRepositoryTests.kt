package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class JdbiActivationCodeRepositoryTests : JdbiRepositoryTestBase() {

    // Instanciamos o userRepo para podermos criar utilizadores legítimos quando necessário
    private val userRepo = JdbiUserRepository(jdbi)
    private val repo = JdbiActivationCodeRepository(jdbi)

    @Test
    fun `createCode deve criar codigo e retornar com isUsed false`() {
        val created = repo.createCode("test-code-123")

        assertEquals("test-code-123", created.code)
        assertFalse(created.isUsed)
        assertNull(created.usedBy)
        assertNotNull(created.createdAt)
    }

    @Test
    fun `getByCode deve retornar codigo existente`() {
        repo.createCode("code-to-find")

        val found = repo.getByCode("code-to-find")

        assertNotNull(found)
        assertEquals("code-to-find", found!!.code)
    }

    @Test
    fun `getByCode deve retornar null quando nao existe`() {
        val found = repo.getByCode("non-existent-code")

        assertNull(found)
    }

    @Test
    fun `markAsUsed deve atualizar codigo como usado`() {
        repo.createCode("code-to-mark")

        // Criamos um utilizador real para garantir que o ID respeita a Foreign Key de 'used_by'
        val user = userRepo.createUser(
            User(id = 0, username = "gymowner", email = "owner@test.com", passwordHash = "hash", role = UserRole.GYM_OWNER)
        )

        // Usamos o ID dinâmico gerado pela BD
        repo.markAsUsed("code-to-mark", user.id)

        val updated = repo.getByCode("code-to-mark")
        assertNotNull(updated)
        assertTrue(updated!!.isUsed)
        assertEquals(user.id, updated.usedBy)
    }

    @Test
    fun `getAllCodes deve retornar lista de todos os codigos`() {
        repo.createCode("code1")
        repo.createCode("code2")
        repo.createCode("code3")

        val allCodes = repo.getAllCodes()

        assertEquals(3, allCodes.size)
    }

    @Test
    fun `getAllCodes deve retornar lista vazia quando nao ha codigos`() {
        val allCodes = repo.getAllCodes()

        assertTrue(allCodes.isEmpty())
    }
}