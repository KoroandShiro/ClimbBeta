package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.ClimberProfile
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class JdbiProfileRepositoryTests:  JdbiRepositoryTestBase() {

    private val userRepo = JdbiUserRepository(jdbi)
    private val profileRepo = JdbiProfileRepository(jdbi)


    @Test
    fun `getClimberProfile deve devolver perfil existente`() {
        val user = userRepo.createUser(
            User(
                username = "climberP",
                email = "climberP@test.com",
                passwordHash = "hash",
                role = UserRole.CLIMBER
            )
        )

        val profile = profileRepo.getClimberProfile(user.id)
        assertNotNull(profile)
        assertEquals(user.id, profile!!.userId)
        assertNull(profile.bio)
    }

    @Test
    fun `updateClimberProfile deve atualizar colunas no registo`() {
        val user = userRepo.createUser(
            User(
                username = "climberUpdate",
                email = "climberUpdate@test.com",
                passwordHash = "hash",
                role = UserRole.CLIMBER
            )
        )

        profileRepo.updateClimberProfile(
            ClimberProfile(
                userId = user.id,
                bio = "Nova bio",
                height = 180,
                apeIndex = 1.04
            )
        )

        val updated = profileRepo.getClimberProfile(user.id)
        assertNotNull(updated)
        assertEquals("Nova bio", updated!!.bio)
        assertEquals(180, updated.height)
        assertEquals(1.04, updated.apeIndex)
    }

    @Test
    fun `getClimberProfile deve devolver null quando nao existe`() {
        assertNull(profileRepo.getClimberProfile(9999))
    }


}
