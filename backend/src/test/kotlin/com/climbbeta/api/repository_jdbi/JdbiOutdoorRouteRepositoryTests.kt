package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class JdbiOutdoorRouteRepositoryTests : JdbiRepositoryTestBase() {

    private val userRepo = JdbiUserRepository(jdbi)
    private val outdoorRouteRepo = JdbiOutdoorRouteRepository(jdbi)

    @Test
    fun `create e getById devem persistir e devolver outdoor route`() {
        val climber = createClimber()

        val createdId = outdoorRouteRepo.create(
            creatorId = climber.id,
            name = "Via A",
            sector = "Sector X",
            location = "Sintra",
            grade = "6a"
        )

        assertTrue(createdId > 0)

        val fetched = outdoorRouteRepo.getById(createdId)
        assertNotNull(fetched)
        assertEquals(createdId, fetched!!.id)
        assertEquals(climber.id, fetched.creatorId)
        assertEquals("Via A", fetched.name)
        assertEquals("Sector X", fetched.sector)
        assertEquals("Sintra", fetched.location)
        assertEquals("6a", fetched.grade)
    }

    @Test
    fun `getAll deve devolver todas as rotas inseridas`() {
        val climber = createClimber()

        val firstId = outdoorRouteRepo.create(climber.id, "Via 1", "Sector A", "Lugar 1", "5c")
        val secondId = outdoorRouteRepo.create(climber.id, null, "Sector B", "Lugar 2", "7a")

        val routes = outdoorRouteRepo.getAll()

        assertEquals(2, routes.size)
        assertTrue(routes.any { it.id == firstId && it.name == "Via 1" && it.creatorId == climber.id })
        assertTrue(routes.any { it.id == secondId && it.name == null && it.creatorId == climber.id })
    }

    @Test
    fun `getById deve devolver null quando nao existe`() {
        val result = outdoorRouteRepo.getById(9999)

        assertNull(result)
    }

    private fun createClimber(): User {
        return userRepo.createUser(
            User(
                username = "climberOutdoor",
                email = "climberOutdoor@test.com",
                passwordHash = "hash",
                role = UserRole.CLIMBER
            )
        )
    }
}
