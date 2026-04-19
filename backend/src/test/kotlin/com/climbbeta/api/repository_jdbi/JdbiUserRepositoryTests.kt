package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class JdbiUserRepositoryTests: JdbiRepositoryTestBase() {

    private val repo = JdbiUserRepository(jdbi)

    @Test
    fun `createUser deve criar utilizador climber e perfil climber`() {
        val created = repo.createUser(
            User(
                username = "climber1",
                email = "climber1@test.com",
                passwordHash = "hash",
                role = UserRole.CLIMBER
            )
        )

        assertTrue(created.id > 0)

        jdbi.useHandle<Exception> { h ->
            val users = h.createQuery("SELECT COUNT(*) FROM users WHERE id = :id")
                .bind("id", created.id)
                .mapTo(Int::class.java)
                .one()
            val profiles = h.createQuery("SELECT COUNT(*) FROM climber_profiles WHERE user_id = :id")
                .bind("id", created.id)
                .mapTo(Int::class.java)
                .one()

            assertEquals(1, users)
            assertEquals(1, profiles)
        }
    }

    @Test
    fun `createUser deve criar perfil gym_owner quando role for GYM_OWNER`() {
        val created = repo.createUser(
            User(
                username = "owner1",
                email = "owner1@test.com",
                passwordHash = "hash",
                role = UserRole.GYM_OWNER
            )
        )

        jdbi.useHandle<Exception> { h ->
            val ownerProfiles = h.createQuery("SELECT COUNT(*) FROM gym_owner_profiles WHERE user_id = :id")
                .bind("id", created.id)
                .mapTo(Int::class.java)
                .one()
            assertEquals(1, ownerProfiles)
        }
    }

    @Test
    fun `existsByEmail e existsByUsername devem refletir dados persistidos`() {
        repo.createUser(
            User(
                username = "userExists",
                email = "exists@test.com",
                passwordHash = "hash",
                role = UserRole.CLIMBER
            )
        )

        assertTrue(repo.existsByEmail("exists@test.com"))
        assertTrue(repo.existsByUsername("userExists"))
        assertFalse(repo.existsByEmail("missing@test.com"))
        assertFalse(repo.existsByUsername("missing"))
    }

    @Test
    fun `getUserByEmail e getUserById devem devolver user persistido`() {
        val created = repo.createUser(
            User(
                username = "u2",
                email = "u2@test.com",
                passwordHash = "hash2",
                role = UserRole.ADMIN
            )
        )

        val byEmail = repo.getUserByEmail("u2@test.com")
        val byId = repo.getUserById(created.id)

        assertNotNull(byEmail)
        assertNotNull(byId)
        assertEquals(created.id, byEmail!!.id)
        assertEquals("u2", byId!!.username)
        assertEquals(UserRole.ADMIN, byId.role)
    }

    @Test
    fun `getUserByEmail e getUserById devem devolver null quando nao existe`() {
        assertNull(repo.getUserByEmail("none@test.com"))
        assertNull(repo.getUserById(9999))
    }


}
