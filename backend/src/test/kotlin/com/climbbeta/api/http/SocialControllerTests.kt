package com.climbbeta.api.http

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.domain.FeedItem
import com.climbbeta.api.services.AscentService
import com.climbbeta.api.services.FollowService
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
class SocialControllerTests {

    @Mock
    private lateinit var followService: FollowService

    @Mock
    private lateinit var ascentService: AscentService

    @InjectMocks
    private lateinit var socialController: SocialController

    private val user = User(id = 1, username = "climber", email = "c@test.com", passwordHash = "hash", role = UserRole.CLIMBER)

    @Test
    fun `follow deve retornar 400 quando utilizador tenta seguir a si mesmo`() {
        val response = socialController.follow(1, user)

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
    }

    @Test
    fun `follow deve retornar 201 quando criado com sucesso`() {
        whenever(followService.follow(1, 2)).thenReturn(true)

        val response = socialController.follow(2, user)

        assertEquals(HttpStatus.CREATED, response.statusCode)
        verify(followService).follow(1, 2) // Garante que o serviço foi mesmo chamado com estes IDs
    }

    @Test
    fun `follow deve retornar 200 quando ja estava a seguir`() {
        whenever(followService.follow(1, 2)).thenReturn(false)

        val response = socialController.follow(2, user)

        assertEquals(HttpStatus.OK, response.statusCode)
        verify(followService).follow(1, 2)
    }

    @Test
    fun `unfollow deve retornar 204 quando removido com sucesso`() {
        whenever(followService.unfollow(1, 2)).thenReturn(true)

        val response = socialController.unfollow(2, user)

        assertEquals(HttpStatus.NO_CONTENT, response.statusCode)
        verify(followService).unfollow(1, 2)
    }

    @Test
    fun `unfollow deve retornar 404 quando nao existe`() {
        whenever(followService.unfollow(1, 2)).thenReturn(false)

        val response = socialController.unfollow(2, user)

        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        verify(followService).unfollow(1, 2)
    }

    @Test
    fun `getFeed deve retornar 200 com os mesmos itens devolvidos pelo servico`() {
        // Criamos um mock genérico do FeedItem para não depender do construtor dele
        val mockFeedItem = mock(FeedItem::class.java)
        val feedItems = listOf(mockFeedItem)

        whenever(ascentService.getFeedForClimber(1)).thenReturn(feedItems)

        val response = socialController.getFeed(user)

        assertEquals(HttpStatus.OK, response.statusCode)
        // ADICIONADO: Garante que o controlador não "perdeu" os dados do feed pelo caminho
        assertEquals(feedItems, response.body)
        verify(ascentService).getFeedForClimber(1)
    }
}