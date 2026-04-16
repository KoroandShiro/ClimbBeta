package com.climbbeta.api.services

import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.domain.Gym
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.repository.BoulderRepository
import com.climbbeta.api.repository.GymRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import java.time.LocalDate

@ExtendWith(MockitoExtension::class)
class BoulderServiceTests {

    @Mock
    private lateinit var boulderRepository: BoulderRepository

    @Mock
    private lateinit var gymRepository: GymRepository

    private lateinit var boulderService: BoulderService

    private val testDate = LocalDate.of(2026, 4, 13)

    @BeforeEach
    fun setup() {
        boulderService = BoulderService(boulderRepository, gymRepository)
    }

    @Test
    fun `createBoulder deve falhar se utilizador nao for o dono do ginasio`() {
        val user = User(id = 1, username = "hacker", email = "h@test", passwordHash = "hash", role = UserRole.CLIMBER)
        val gym = Gym(id = 10, ownerId = 99, name = "Gym", address = "A", city = "C")

        `when`(gymRepository.getGymById(10)).thenReturn(gym)

        val ex = assertThrows<SecurityException> {
            boulderService.createBoulder(user, 10, "Amarelo", null, "V3", "Koro", testDate, null)
        }
        assertEquals("Apenas o dono do ginásio pode adicionar vias aqui.", ex.message)
    }

    @Test
    fun `createBoulder deve ter sucesso se for o dono`() {
        val user = User(id = 99, username = "owner", email = "o@test", passwordHash = "hash", role = UserRole.GYM_OWNER)
        val gym = Gym(id = 10, ownerId = 99, name = "Gym", address = "A", city = "C")
        val expectedBoulder = Boulder(id = 1, gymId = 10, color = "Amarelo", grade = "V3", setDate = testDate, hexColor = null, setterName = "Koro", imageUrl = null)

        `when`(gymRepository.getGymById(10)).thenReturn(gym)
        `when`(boulderRepository.createBoulder(any())).thenReturn(expectedBoulder)

        val result = boulderService.createBoulder(user, 10, "Amarelo", null, "V3", "Koro", testDate, null)
        
        assertNotNull(result)
        assertEquals(1, result.id)
    }

    @Test
    fun `updateBoulderStatus deve falhar se boulder nao existir`() {
        val user = User(id = 1, username = "admin", email = "a@test", passwordHash = "h", role = UserRole.ADMIN)
        `when`(boulderRepository.getBoulderById(1)).thenReturn(null)

        val ex = assertThrows<IllegalArgumentException> {
            boulderService.updateBoulderStatus(user, 1, false)
        }
        assertEquals("Via não encontrada.", ex.message)
    }

    @Test
    fun `updateBoulderStatus deve desativar a via se for ADMIN`() {
        val admin = User(id = 1, username = "admin", email = "a@test", passwordHash = "h", role = UserRole.ADMIN)
        val boulder = Boulder(id = 1, gymId = 10, color = "Azul", grade = "V4", setDate = testDate)
        val gym = Gym(id = 10, ownerId = 99, name = "Gym", address = "A", city = "C")

        `when`(boulderRepository.getBoulderById(1)).thenReturn(boulder)
        `when`(gymRepository.getGymById(10)).thenReturn(gym)

        boulderService.updateBoulderStatus(admin, 1, false)

        // Verificamos se o repositório foi efetivamente chamado com isActive=false
        verify(boulderRepository).updateBoulderStatus(1, false)
    }
}