package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.Ascent
import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.domain.Gym
import com.climbbeta.api.domain.OutdoorRoute
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.time.LocalDate

class JdbiAscentRepositoryTests : JdbiRepositoryTestBase() {

    private val userRepo = JdbiUserRepository(jdbi)
    private val gymRepo = JdbiGymRepository(jdbi)
    private val boulderRepo = JdbiBoulderRepository(jdbi)
    private val outdoorRouteRepo = JdbiOutdoorRouteRepository(jdbi)
    private val ascentRepo = JdbiAscentRepository(jdbi)

    @Test
    fun `create e getById devem persistir subida indoor`() {
        val climber = createClimber()
        val boulder = createBoulderForClimber()

        val date = LocalDate.of(2026, 4, 10)

        val ascentId = ascentRepo.create(
            climberId = climber.id,
            boulderId = boulder.id,
            outdoorRouteId = null,
            freelogGymName = null,
            freelogGrade = null,
            date = date,
            attempts = 3,
            style = "flash",
            notes = "boa tentativa"
        )

        assertTrue(ascentId > 0)

        val fetched = ascentRepo.getById(ascentId)
        assertNotNull(fetched)
        assertEquals(ascentId, fetched!!.id)
        assertEquals(climber.id, fetched.climberId)
        assertEquals(boulder.id, fetched.boulderId)
        assertNull(fetched.outdoorRouteId)
        assertEquals(date, fetched.date)
        assertEquals(3, fetched.attempts)
        assertEquals("flash", fetched.style)
        assertEquals("boa tentativa", fetched.notes)
    }

    @Test
    fun `create e getByClimberId devem devolver subidas ordenadas por data desc`() {
        val climber = createClimber()
        val boulder = createBoulderForClimber()

        val firstDate = LocalDate.of(2026, 4, 1)
        val secondDate = LocalDate.of(2026, 4, 20)

        ascentRepo.create(
            climberId = climber.id,
            boulderId = boulder.id,
            outdoorRouteId = null,
            freelogGymName = null,
            freelogGrade = null,
            date = firstDate,
            attempts = 1,
            style = "redpoint",
            notes = "primeira"
        )

        ascentRepo.create(
            climberId = climber.id,
            boulderId = boulder.id,
            outdoorRouteId = null,
            freelogGymName = null,
            freelogGrade = null,
            date = secondDate,
            attempts = 2,
            style = "onsight",
            notes = "segunda"
        )

        val ascents = ascentRepo.getByClimberId(climber.id)

        assertEquals(2, ascents.size)
        assertEquals(secondDate, ascents[0].date)
        assertEquals(firstDate, ascents[1].date)
        assertTrue(ascents.all { it.climberId == climber.id })
    }

    @Test
    fun `create e delete devem funcionar para subida outdoor`() {
        val climber = createClimber()
        val route = createOutdoorRouteForClimber(climber)

        val date = LocalDate.of(2026, 3, 15)

        val ascentId = ascentRepo.create(
            climberId = climber.id,
            boulderId = null,
            outdoorRouteId = route.id,
            freelogGymName = "Freelog Spot",
            freelogGrade = "6b",
            date = date,
            attempts = 1,
            style = null,
            notes = "subida outdoor"
        )

        assertTrue(ascentId > 0)

        val deleted = ascentRepo.delete(ascentId, climber.id)
        assertTrue(deleted)

        val fetchedAfterDelete = ascentRepo.getById(ascentId)
        assertNull(fetchedAfterDelete)

        assertFalse(ascentRepo.delete(9999, climber.id))
    }

    private fun createClimber(): User {
        return userRepo.createUser(
            User(
                username = "climberAscent",
                email = "climberAscent@test.com",
                passwordHash = "hash",
                role = UserRole.CLIMBER
            )
        )
    }

    private fun createBoulderForClimber(): Boulder {
        val owner = userRepo.createUser(
            User(
                username = "ownerAscent",
                email = "ownerAscent@test.com",
                passwordHash = "hash",
                role = UserRole.GYM_OWNER
            )
        )

        val gym = gymRepo.createGym(
            Gym(
                id = 0,
                ownerId = owner.id,
                name = "Gym Ascent",
                address = "Rua Ascent",
                city = "Lisboa",
                coverImageUrl = null
            )
        )

        return boulderRepo.createBoulder(
            Boulder(
                id = 0,
                gymId = gym.id,
                color = "Azul",
                hexColor = "#0000FF",
                grade = "V3",
                setterName = "Setter",
                setDate = LocalDate.of(2026, 4, 5),
                isActive = true,
                imageUrl = null
            )
        )
    }

    private fun createOutdoorRouteForClimber(climber: User): OutdoorRoute {
        val routeId = outdoorRouteRepo.create(
            creatorId = climber.id,
            name = "Via Outdoor",
            sector = "Sector Norte",
            location = "Arrábida",
            grade = "6a"
        )

        return OutdoorRoute(
            id = routeId,
            creatorId = climber.id,
            name = "Via Outdoor",
            sector = "Sector Norte",
            location = "Arrábida",
            grade = "6a"
        )
    }
}
