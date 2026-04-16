package com.climbbeta.api.services

import com.climbbeta.api.domain.ClimberProfile
import com.climbbeta.api.repository.ProfileRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class ProfileServiceTests {

    @Mock
    private lateinit var profileRepository: ProfileRepository

    private lateinit var profileService: ProfileService

    @BeforeEach
    fun setup() {
        profileService = ProfileService(profileRepository)
    }

    @Test
    fun `getClimberProfile deve falhar se o utilizador nao tiver perfil registado`() {
        `when`(profileRepository.getClimberProfile(99)).thenReturn(null)

        val ex = assertThrows<IllegalArgumentException> {
            profileService.getClimberProfile(99)
        }
        assertEquals("Perfil não encontrado.", ex.message)
    }

    @Test
    fun `updateClimberProfile deve chamar o repositorio corretamente`() {
        profileService.updateClimberProfile(1, "Nova Bio", 180, 1.02)
        
        // Verifica que o Repositório recebeu um objeto com os valores certos
        val expectedProfile = ClimberProfile(userId = 1, bio = "Nova Bio", height = 180, apeIndex = 1.02)
        verify(profileRepository).updateClimberProfile(expectedProfile)
    }
}