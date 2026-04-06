package com.climbbeta.api

import com.climbbeta.api.domain.Gym
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.repository.GymRepository
import com.climbbeta.api.repository.UserRepository
import com.climbbeta.api.services.GymService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any

@ExtendWith(MockitoExtension::class)
class GymServiceTests {

    @Mock
    private lateinit var gymRepository: GymRepository

    @Mock
    private lateinit var userRepository: UserRepository

    private lateinit var gymService: GymService

    @BeforeEach
    fun setup() {
        gymService = GymService(gymRepository, userRepository)
    }

    @Test
    fun `createGym deve criar ginasio com sucesso para ADMIN`() {
        // Arrange
        val adminUser = User(id = 1, username = "admin", email = "admin@test.com", passwordHash = "hash", role = UserRole.ADMIN)
        val ownerUser = User(id = 2, username = "owner", email = "owner@test.com", passwordHash = "hash", role = UserRole.GYM_OWNER)
        
        // Simular que o dono existe
        `when`(userRepository.getUserById(2)).thenReturn(ownerUser)
        `when`(gymRepository.existsGymOwnerProfile(2)).thenReturn(true)
        
        val expectedGym = Gym(id = 1, ownerId = 2, name = "Test Gym", address = "Address", city = "City", coverImageUrl = null)
        `when`(gymRepository.createGym(any())).thenReturn(expectedGym)

        // Act
        val result = gymService.createGym(adminUser, 2, "Test Gym", "Address", "City", null)

        // Assert
        assertNotNull(result)
        assertEquals(expectedGym.id, result.id)
        assertEquals(expectedGym.name, result.name)
    }

    @Test
    fun `createGym deve falhar as validacoes se ownerId for invalido`() {
        // Arrange
        val adminUser = User(id = 1, username = "admin", email = "admin@test.com", passwordHash = "hash", role = UserRole.ADMIN)

        // Act & Assert
        val exception = assertThrows<IllegalArgumentException> {
            gymService.createGym(adminUser, -1, "Test Gym", "Address", "City", null)
        }
        assertEquals("ownerId inválido.", exception.message)
    }
}