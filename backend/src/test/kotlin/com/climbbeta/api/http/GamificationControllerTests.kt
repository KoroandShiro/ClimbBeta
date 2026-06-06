package com.climbbeta.api.http

import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.domain.LeaderboardEntry
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.services.GamificationService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus

@ExtendWith(MockitoExtension::class)
class GamificationControllerTests {

    @Mock
    private lateinit var gamificationService: GamificationService

    @InjectMocks
    private lateinit var gamificationController: GamificationController

    private val user = User(id = 1, username = "climber", email = "c@test.com", passwordHash = "hash", role = UserRole.CLIMBER)

    @Test
    fun `likeAscent deve retornar 201 quando criado com sucesso`() {
        whenever(gamificationService.likeAscent(1, 10)).thenReturn(true)

        val response = gamificationController.likeAscent(10, user)

        assertEquals(HttpStatus.CREATED, response.statusCode)
        verify(gamificationService).likeAscent(1, 10) // Garante que a ordem (userId, ascentId) está correta
    }

    @Test
    fun `likeAscent deve retornar 200 quando ja existia`() {
        whenever(gamificationService.likeAscent(1, 10)).thenReturn(false)

        val response = gamificationController.likeAscent(10, user)

        assertEquals(HttpStatus.OK, response.statusCode)
        verify(gamificationService).likeAscent(1, 10)
    }

    @Test
    fun `unlikeAscent deve retornar 204 quando removido com sucesso`() {
        whenever(gamificationService.unlikeAscent(1, 10)).thenReturn(true)

        val response = gamificationController.unlikeAscent(10, user)

        assertEquals(HttpStatus.NO_CONTENT, response.statusCode)
        verify(gamificationService).unlikeAscent(1, 10)
    }

    @Test
    fun `unlikeAscent deve retornar 404 quando nao existe`() {
        whenever(gamificationService.unlikeAscent(1, 10)).thenReturn(false)

        val response = gamificationController.unlikeAscent(10, user)

        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        verify(gamificationService).unlikeAscent(1, 10)
    }

    @Test
    fun `saveBoulder deve retornar 201 quando criado com sucesso`() {
        whenever(gamificationService.saveBoulder(1, 5)).thenReturn(true)

        val response = gamificationController.saveBoulder(5, user)

        assertEquals(HttpStatus.CREATED, response.statusCode)
        verify(gamificationService).saveBoulder(1, 5) // Garante que a ordem (userId, boulderId) está correta
    }

    @Test
    fun `saveBoulder deve retornar 200 quando ja existia`() {
        whenever(gamificationService.saveBoulder(1, 5)).thenReturn(false)

        val response = gamificationController.saveBoulder(5, user)

        assertEquals(HttpStatus.OK, response.statusCode)
        verify(gamificationService).saveBoulder(1, 5)
    }

    @Test
    fun `unsaveBoulder deve retornar 204 quando removido com sucesso`() {
        whenever(gamificationService.unsaveBoulder(1, 5)).thenReturn(true)

        val response = gamificationController.unsaveBoulder(5, user)

        assertEquals(HttpStatus.NO_CONTENT, response.statusCode)
        verify(gamificationService).unsaveBoulder(1, 5)
    }

    @Test
    fun `unsaveBoulder deve retornar 404 quando nao existe`() {
        whenever(gamificationService.unsaveBoulder(1, 5)).thenReturn(false)

        val response = gamificationController.unsaveBoulder(5, user)

        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        verify(gamificationService).unsaveBoulder(1, 5)
    }

    @Test
    fun `getSavedBoulders deve retornar 200 com lista de boulders`() {
        val mockBoulder = mock(Boulder::class.java)
        val boulders = listOf(mockBoulder)
        whenever(gamificationService.getSavedBoulders(1)).thenReturn(boulders)

        val response = gamificationController.getSavedBoulders(user)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(boulders, response.body) // ADICIONADO: Garante que os dados chegam ao cliente
        verify(gamificationService).getSavedBoulders(1)
    }

    @Test
    fun `getLeaderboard deve retornar 200 com leaderboard`() {
        val mockEntry = mock(LeaderboardEntry::class.java)
        val leaderboard = listOf(mockEntry)
        whenever(gamificationService.getLeaderboard(5)).thenReturn(leaderboard)

        val response = gamificationController.getLeaderboard(5)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(leaderboard, response.body) // ADICIONADO: Garante que os dados chegam ao cliente
        verify(gamificationService).getLeaderboard(5)
    }
}