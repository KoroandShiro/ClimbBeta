package com.climbbeta.api.services

import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.domain.LeaderboardEntry
import com.climbbeta.api.repository.BoulderRepository
import com.climbbeta.api.repository.LikeRepository
import com.climbbeta.api.repository.SaveRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDate

@ExtendWith(MockitoExtension::class)
class GamificationServiceTests {

    @Mock
    private lateinit var likeRepository: LikeRepository

    @Mock
    private lateinit var saveRepository: SaveRepository

    @Mock
    private lateinit var boulderRepository: BoulderRepository

    private lateinit var gamificationService: GamificationService

    @BeforeEach
    fun setup() {
        gamificationService = GamificationService(likeRepository, saveRepository, boulderRepository)
    }

    @Test
    fun `likeAscent deve chamar o repositorio corretamente`() {
        `when`(likeRepository.like(1, 10)).thenReturn(true)

        val result = gamificationService.likeAscent(1, 10)

        assertTrue(result)
        verify(likeRepository).like(1, 10)
    }

    @Test
    fun `unlikeAscent deve chamar o repositorio corretamente`() {
        `when`(likeRepository.unlike(1, 10)).thenReturn(true)

        val result = gamificationService.unlikeAscent(1, 10)

        assertTrue(result)
        verify(likeRepository).unlike(1, 10)
    }

    @Test
    fun `isAscentLiked deve chamar o repositorio corretamente`() {
        `when`(likeRepository.isLiked(1, 10)).thenReturn(true)

        val result = gamificationService.isAscentLiked(1, 10)

        assertTrue(result)
        verify(likeRepository).isLiked(1, 10)
    }

    @Test
    fun `getAscentLikeCount deve chamar o repositorio corretamente`() {
        `when`(likeRepository.getLikeCount(10)).thenReturn(5)

        val result = gamificationService.getAscentLikeCount(10)

        assertEquals(5, result)
        verify(likeRepository).getLikeCount(10)
    }

    @Test
    fun `saveBoulder deve chamar o repositorio corretamente`() {
        `when`(saveRepository.save(1, 5)).thenReturn(true)

        val result = gamificationService.saveBoulder(1, 5)

        assertTrue(result)
        verify(saveRepository).save(1, 5)
    }

    @Test
    fun `unsaveBoulder deve chamar o repositorio corretamente`() {
        `when`(saveRepository.unsave(1, 5)).thenReturn(true)

        val result = gamificationService.unsaveBoulder(1, 5)

        assertTrue(result)
        verify(saveRepository).unsave(1, 5)
    }

    @Test
    fun `isBoulderSaved deve chamar o repositorio corretamente`() {
        `when`(saveRepository.isSaved(1, 5)).thenReturn(true)

        val result = gamificationService.isBoulderSaved(1, 5)

        assertTrue(result)
        verify(saveRepository).isSaved(1, 5)
    }

    @Test
    fun `getSavedBoulders deve chamar o repositorio corretamente`() {
        val boulders = listOf(
            Boulder(id = 1, gymId = 10, color = "Vermelho", grade = "V3", setDate = LocalDate.now())
        )
        `when`(saveRepository.getSavedBoulders(1)).thenReturn(boulders)

        val result = gamificationService.getSavedBoulders(1)

        assertEquals(1, result.size)
        assertEquals(1, result[0].id)
        verify(saveRepository).getSavedBoulders(1)
    }

    @Test
    fun `getLeaderboard deve chamar o repositorio corretamente`() {
        val leaderboard = listOf(
            LeaderboardEntry(
                rank = 1,
                climberId = 1,         // Alterado de userId para climberId
                username = "user1",
                avatarUrl = null,      // Adicionado (ou "http://..." se for String não-nullable)
                date = LocalDate.now(), // Alterado de ascentDate para date
                attempts = 1,          // Adicionado
                style = "Flash"        // Adicionado
            )
        )
        `when`(boulderRepository.getLeaderboard(5)).thenReturn(leaderboard)

        val result = gamificationService.getLeaderboard(5)

        assertEquals(1, result.size)
        verify(boulderRepository).getLeaderboard(5)
    }

    @Test
    fun `likeAscent deve retornar false quando o repositorio falha`() {
        `when`(likeRepository.like(1, 10)).thenReturn(false)

        val result = gamificationService.likeAscent(1, 10)

        assertFalse(result)
        verify(likeRepository).like(1, 10)
    }

    @Test
    fun `isBoulderSaved deve retornar false quando nao esta guardado`() {
        `when`(saveRepository.isSaved(1, 5)).thenReturn(false)

        val result = gamificationService.isBoulderSaved(1, 5)

        assertFalse(result)
        verify(saveRepository).isSaved(1, 5)
    }

    @Test
    fun `getSavedBoulders deve retornar lista vazia se o climber nao tiver boulders guardados`() {
        `when`(saveRepository.getSavedBoulders(1)).thenReturn(emptyList())

        val result = gamificationService.getSavedBoulders(1)

        assertTrue(result.isEmpty())
        verify(saveRepository).getSavedBoulders(1)
    }

    @Test
    fun `getLeaderboard deve retornar lista vazia se o boulder nao tiver ascensões`() {
        `when`(boulderRepository.getLeaderboard(5)).thenReturn(emptyList())

        val result = gamificationService.getLeaderboard(5)

        assertTrue(result.isEmpty())
        verify(boulderRepository).getLeaderboard(5)
    }
}