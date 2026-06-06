package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class JdbiLikeRepositoryTests : JdbiRepositoryTestBase() {

    private val userRepo = JdbiUserRepository(jdbi)
    private val repo = JdbiLikeRepository(jdbi)

    // IDs dinâmicos gerados pela BD para garantir que as FKs são válidas
    private var ascentId = 0
    private var climberId1 = 0
    private var climberId2 = 0
    private var climberId3 = 0

    @BeforeEach
    fun setupData() {
        // 1. Criar utilizadores reais na BD de testes
        val user1 = userRepo.createUser(User(id = 0, username = "u1", email = "u1@t.com", passwordHash = "h", role = UserRole.CLIMBER))
        val user2 = userRepo.createUser(User(id = 0, username = "u2", email = "u2@t.com", passwordHash = "h", role = UserRole.CLIMBER))
        val user3 = userRepo.createUser(User(id = 0, username = "u3", email = "u3@t.com", passwordHash = "h", role = UserRole.CLIMBER))

        climberId1 = user1.id
        climberId2 = user2.id
        climberId3 = user3.id

        // 2. Inserir uma ascensão fictícia diretamente via JDBI handle para popular a FK 'ascent_id'
        // (Ajusta os nomes das colunas conforme a tua tabela real 'ascents' se necessário)
        ascentId = jdbi.withHandle<Int, Exception> { handle ->
            handle.createUpdate(
                """
                INSERT INTO ascents (climber_id, boulder_id, date, attempts, style) 
                VALUES (:climberId, :boulderId, NOW(), 1, 'Redpoint')
                """
            )
                .bind("climberId", climberId1)
                .bind("boulderId", 1) // ID fictício para o boulder (ou cria um boulder real se houver FK estrita aqui)
                .executeAndReturnGeneratedKeys("id")
                .mapTo(Int::class.java)
                .one()
        }
    }

    @Test
    fun `like deve criar like e retornar true`() {
        val result = repo.like(climberId1, ascentId)

        assertTrue(result)
    }

    @Test
    fun `like deve retornar false quando ja existe`() {
        repo.like(climberId1, ascentId)

        val result = repo.like(climberId1, ascentId)

        assertFalse(result)
    }

    @Test
    fun `unlike deve remover like e retornar true`() {
        repo.like(climberId1, ascentId)

        val result = repo.unlike(climberId1, ascentId)

        assertTrue(result)
    }

    @Test
    fun `unlike deve retornar false quando nao existe`() {
        val result = repo.unlike(climberId1, ascentId)

        assertFalse(result)
    }

    @Test
    fun `isLiked deve retornar true quando like existe`() {
        repo.like(climberId1, ascentId)

        val result = repo.isLiked(climberId1, ascentId)

        assertTrue(result)
    }

    @Test
    fun `isLiked deve retornar false quando like nao existe`() {
        val result = repo.isLiked(climberId1, ascentId)

        assertFalse(result)
    }

    @Test
    fun `getLikeCount deve retornar numero de likes`() {
        repo.like(climberId1, ascentId)
        repo.like(climberId2, ascentId)
        repo.like(climberId3, ascentId)

        val count = repo.getLikeCount(ascentId)

        assertEquals(3, count)
    }

    @Test
    fun `getLikeCount deve retornar 0 quando nao ha likes`() {
        val count = repo.getLikeCount(ascentId)

        assertEquals(0, count)
    }
}