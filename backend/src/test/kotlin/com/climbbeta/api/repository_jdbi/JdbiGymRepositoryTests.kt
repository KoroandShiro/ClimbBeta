package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.Gym
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class JdbiGymRepositoryTests: JdbiRepositoryTestBase() {

    private val userRepo = JdbiUserRepository(jdbi)
    private val gymRepo = JdbiGymRepository(jdbi)

    @Test
    fun `createGym e getGymById devem persistir e devolver ginasio`() {
        val owner = userRepo.createUser(
            User(
                username = "ownerGym",
                email = "ownerGym@test.com",
                passwordHash = "hash",
                role = UserRole.GYM_OWNER
            )
        )

        val created = gymRepo.createGym(
            Gym(
                id = 0,
                ownerId = owner.id,
                name = "Gym A",
                address = "Rua A",
                city = "Lisboa",
                coverImageUrl = null
            )
        )

        assertTrue(created.id > 0)

        val fetched = gymRepo.getGymById(created.id)
        assertNotNull(fetched)
        assertEquals("Gym A", fetched!!.name)
        assertEquals(owner.id, fetched.ownerId)
    }

    @Test
    fun `getGyms deve devolver lista ordenada por id`() {
        val owner = userRepo.createUser(
            User(
                username = "ownerList",
                email = "ownerList@test.com",
                passwordHash = "hash",
                role = UserRole.GYM_OWNER
            )
        )

        gymRepo.createGym(Gym(0, owner.id, "Gym 1", "A1", "Porto", null))
        gymRepo.createGym(Gym(0, owner.id, "Gym 2", "A2", "Porto", null))

        val gyms = gymRepo.getGyms()
        assertEquals(2, gyms.size)
        assertTrue(gyms[0].id < gyms[1].id)
    }

    @Test
    fun `updateGym deve devolver true e aplicar alteracoes`() {
        val owner = userRepo.createUser(
            User(
                username = "ownerUpd",
                email = "ownerUpd@test.com",
                passwordHash = "hash",
                role = UserRole.GYM_OWNER
            )
        )

        val created = gymRepo.createGym(Gym(0, owner.id, "Gym Old", "Old", "OldCity", null))
        val updated = gymRepo.updateGym(
            created.copy(name = "Gym New", address = "New", city = "Lisboa", coverImageUrl = "http://img")
        )

        assertTrue(updated)

        val fetched = gymRepo.getGymById(created.id)
        assertEquals("Gym New", fetched!!.name)
        assertEquals("Lisboa", fetched.city)
        assertEquals("http://img", fetched.coverImageUrl)
    }

    @Test
    fun `updateGym deve devolver false para id inexistente`() {
        val result = gymRepo.updateGym(
            Gym(9999, 1, "X", "Y", "Z", null)
        )
        assertFalse(result)
    }

    @Test
    fun `existsGymOwnerProfile deve refletir se perfil existe`() {
        val owner = userRepo.createUser(
            User(
                username = "ownerExists",
                email = "ownerExists@test.com",
                passwordHash = "hash",
                role = UserRole.GYM_OWNER
            )
        )

        val climber = userRepo.createUser(
            User(
                username = "climberNoOwnerProfile",
                email = "climberNoOwnerProfile@test.com",
                passwordHash = "hash",
                role = UserRole.CLIMBER
            )
        )

        assertTrue(gymRepo.existsGymOwnerProfile(owner.id))
        assertFalse(gymRepo.existsGymOwnerProfile(climber.id))
        assertFalse(gymRepo.existsGymOwnerProfile(9999))
    }


}
