package com.climbbeta.api.services

import com.climbbeta.api.repository.FollowRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class FollowServiceTests {

    @Mock
    private lateinit var followRepository: FollowRepository

    private lateinit var followService: FollowService

    @BeforeEach
    fun setup() {
        followService = FollowService(followRepository)
    }

    @Test
    fun `follow deve chamar o repositorio corretamente`() {
        `when`(followRepository.follow(1, 2)).thenReturn(true)

        val result = followService.follow(1, 2)

        assertTrue(result)
        verify(followRepository).follow(1, 2)
    }

    @Test
    fun `unfollow deve chamar o repositorio corretamente`() {
        `when`(followRepository.unfollow(1, 2)).thenReturn(true)

        val result = followService.unfollow(1, 2)

        assertTrue(result)
        verify(followRepository).unfollow(1, 2)
    }

    @Test
    fun `isFollowing deve chamar o repositorio corretamente`() {
        `when`(followRepository.isFollowing(1, 2)).thenReturn(true)

        val result = followService.isFollowing(1, 2)

        assertTrue(result)
        verify(followRepository).isFollowing(1, 2)
    }

    @Test
    fun `getFollowersCount deve chamar o repositorio corretamente`() {
        `when`(followRepository.getFollowersCount(1)).thenReturn(5)

        val result = followService.getFollowersCount(1)

        assertEquals(5, result)
        verify(followRepository).getFollowersCount(1)
    }

    @Test
    fun `getFollowingCount deve chamar o repositorio corretamente`() {
        `when`(followRepository.getFollowingCount(1)).thenReturn(3)

        val result = followService.getFollowingCount(1)

        assertEquals(3, result)
        verify(followRepository).getFollowingCount(1)
    }

    @Test
    fun `follow deve retornar false quando o repositorio falha`() {
        `when`(followRepository.follow(1, 2)).thenReturn(false)

        val result = followService.follow(1, 2)

        assertFalse(result)
        verify(followRepository).follow(1, 2)
    }

    @Test
    fun `unfollow deve retornar false quando o repositorio falha`() {
        `when`(followRepository.unfollow(1, 2)).thenReturn(false)

        val result = followService.unfollow(1, 2)

        assertFalse(result)
        verify(followRepository).unfollow(1, 2)
    }

    @Test
    fun `isFollowing deve retornar false quando nao esta a seguir`() {
        `when`(followRepository.isFollowing(1, 2)).thenReturn(false)

        val result = followService.isFollowing(1, 2)

        assertFalse(result)
        verify(followRepository).isFollowing(1, 2)
    }
}