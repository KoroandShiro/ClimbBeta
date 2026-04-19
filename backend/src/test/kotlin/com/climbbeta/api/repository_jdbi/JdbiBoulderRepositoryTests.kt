package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.domain.Gym
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.time.LocalDate

class JdbiBoulderRepositoryTests: JdbiRepositoryTestBase() {

    private val userRepo = JdbiUserRepository(jdbi)
    private val gymRepo = JdbiGymRepository(jdbi)
    private val boulderRepo = JdbiBoulderRepository(jdbi)


    @Test
    fun `createBoulder e getBoulderById devem persistir e devolver via`() {
        val gym = createGymOwnerAndGym()

        val created = boulderRepo.createBoulder(
            Boulder(
                gymId = gym.id,
                color = "Amarelo",
                hexColor = "#FFFF00",
                grade = "V4",
                setterName = "Koro",
                setDate = LocalDate.of(2026, 4, 10),
                isActive = true,
                imageUrl = "http://img"
            )
        )

        assertTrue(created.id > 0)

        val fetched = boulderRepo.getBoulderById(created.id)
        assertNotNull(fetched)
        assertEquals("Amarelo", fetched!!.color)
        assertEquals("#FFFF00", fetched.hexColor)
        assertTrue(fetched.isActive)
    }

    @Test
    fun `getBouldersByGymId deve devolver apenas vias ativas ordenadas por setDate desc`() {
        val gym = createGymOwnerAndGym()

        boulderRepo.createBoulder(
            Boulder(
                gymId = gym.id,
                color = "Azul",
                grade = "V2",
                setterName = "S1",
                setDate = LocalDate.of(2026, 4, 1),
                isActive = true
            )
        )
        boulderRepo.createBoulder(
            Boulder(
                gymId = gym.id,
                color = "Vermelho",
                grade = "V5",
                setterName = "S2",
                setDate = LocalDate.of(2026, 4, 20),
                isActive = true
            )
        )
        boulderRepo.createBoulder(
            Boulder(
                gymId = gym.id,
                color = "Preto",
                grade = "V8",
                setterName = "S3",
                setDate = LocalDate.of(2026, 4, 15),
                isActive = false
            )
        )

        val active = boulderRepo.getBouldersByGymId(gym.id)

        assertEquals(2, active.size)
        assertEquals("Vermelho", active[0].color)
        assertEquals("Azul", active[1].color)
        assertTrue(active.all { it.isActive })
    }

    @Test
    fun `updateBoulderStatus deve devolver true para id existente e atualizar estado`() {
        val gym = createGymOwnerAndGym()
        val created = boulderRepo.createBoulder(
            Boulder(
                gymId = gym.id,
                color = "Verde",
                grade = "V3",
                setterName = "Setter",
                setDate = LocalDate.of(2026, 4, 12),
                isActive = true
            )
        )

        val updated = boulderRepo.updateBoulderStatus(created.id, false)
        assertTrue(updated)

        val fetched = boulderRepo.getBoulderById(created.id)
        assertNotNull(fetched)
        assertFalse(fetched!!.isActive)
    }

    @Test
    fun `updateBoulderStatus deve devolver false para id inexistente`() {
        val updated = boulderRepo.updateBoulderStatus(9999, false)
        assertFalse(updated)
    }

    private fun createGymOwnerAndGym(): Gym {
        val owner = userRepo.createUser(
            User(
                username = "ownerBoulder",
                email = "ownerBoulder@test.com",
                passwordHash = "hash",
                role = UserRole.GYM_OWNER
            )
        )

        return gymRepo.createGym(
            Gym(
                id = 0,
                ownerId = owner.id,
                name = "Gym Boulder",
                address = "Rua Boulder",
                city = "Lisboa",
                coverImageUrl = null
            )
        )
    }

}
