package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.domain.Gym
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDate

class JdbiSaveRepositoryTests : JdbiRepositoryTestBase() {

    private val userRepo = JdbiUserRepository(jdbi)
    private val gymRepo = JdbiGymRepository(jdbi)
    private val boulderRepo = JdbiBoulderRepository(jdbi)
    private val saveRepo = JdbiSaveRepository(jdbi)

    // Variáveis para guardar os IDs reais criados na BD antes de cada teste
    private var climberId = 0
    private var boulderId = 0

    @BeforeEach
    fun setupData() {
        val user = userRepo.createUser(
            User(id = 0, username = "climber", email = "c@test.com", passwordHash = "hash", role = UserRole.CLIMBER)
        )
        val gym = gymRepo.createGym(
            Gym(id = 0, ownerId = user.id, name = "Test Gym", address = "Address", city = "City")
        )
        val boulder = boulderRepo.createBoulder(
            Boulder(
                id = 0,
                gymId = gym.id,
                color = "Vermelho",
                grade = "V3",
                setDate = LocalDate.now(),
                setterName = "Setter"
            )
        )

        climberId = user.id
        boulderId = boulder.id
    }

    @Test
    fun `save deve criar save e retornar true`() {
        // Usar os IDs reais que existem na BD
        val result = saveRepo.save(climberId, boulderId)

        assertTrue(result)
    }

    @Test
    fun `save deve retornar false quando ja existe`() {
        saveRepo.save(climberId, boulderId)

        val result = saveRepo.save(climberId, boulderId)

        assertFalse(result)
    }

    @Test
    fun `unsave deve remover save e retornar true`() {
        saveRepo.save(climberId, boulderId)

        val result = saveRepo.unsave(climberId, boulderId)

        assertTrue(result)
    }

    @Test
    fun `unsave deve retornar false quando nao existe`() {
        val result = saveRepo.unsave(climberId, boulderId)

        assertFalse(result)
    }

    @Test
    fun `isSaved deve retornar true quando save existe`() {
        saveRepo.save(climberId, boulderId)

        val result = saveRepo.isSaved(climberId, boulderId)

        assertTrue(result)
    }

    @Test
    fun `isSaved deve retornar false quando save nao existe`() {
        val result = saveRepo.isSaved(climberId, boulderId)

        assertFalse(result)
    }

    @Test
    fun `getSavedBoulders deve retornar lista de boulders guardados`() {
        saveRepo.save(climberId, boulderId)

        val savedBoulders = saveRepo.getSavedBoulders(climberId)

        assertEquals(1, savedBoulders.size)
        assertEquals(boulderId, savedBoulders[0].id)
    }

    @Test
    fun `getSavedBoulders deve retornar lista vazia quando nao ha saves`() {
        val savedBoulders = saveRepo.getSavedBoulders(climberId)

        assertTrue(savedBoulders.isEmpty())
    }
}