package com.climbbeta.api.services

import com.climbbeta.api.domain.Token
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.repository.TokenRepository
import com.climbbeta.api.repository.UserRepository
import com.climbbeta.api.services.UserService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mindrot.jbcrypt.BCrypt
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any

@ExtendWith(MockitoExtension::class)
class UserServiceTests {

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var tokenRepository: TokenRepository

    private lateinit var userService: UserService

    @BeforeEach
    fun setup() {
        userService = UserService(userRepository, tokenRepository)
    }

    @Test
    fun `createUser deve falhar se email ja existir`() {
        `when`(userRepository.existsByEmail("teste@teste.com")).thenReturn(true)

        val exception = assertThrows<IllegalArgumentException> {
            userService.createUser("user1", "teste@teste.com", "pass123", UserRole.CLIMBER)
        }
        assertEquals("Este email já está registado!", exception.message)
    }

    @Test
    fun `createUser deve criar utilizador com sucesso`() {
        `when`(userRepository.existsByEmail("novo@teste.com")).thenReturn(false)
        `when`(userRepository.existsByUsername("novo")).thenReturn(false)
        
        val expectedUser = User(id = 1, username = "novo", email = "novo@teste.com", passwordHash = "hash", role = UserRole.CLIMBER)
        `when`(userRepository.createUser(any())).thenReturn(expectedUser)

        val result = userService.createUser("novo", "novo@teste.com", "pass123", UserRole.CLIMBER)

        assertEquals("novo", result.username)
        assertEquals(1, result.id)
    }

    @Test
    fun `login deve falhar com credenciais invalidas`() {
        `when`(userRepository.getUserByEmail("errado@teste.com")).thenReturn(null)

        val exception = assertThrows<IllegalArgumentException> {
            userService.login("errado@teste.com", "pass123")
        }
        assertEquals("Credenciais inválidas.", exception.message)
    }

    @Test
    fun `login deve gerar token com sucesso se a password for valida`() {
        // Criamos um Hash verdadeiro para o teste passar no BCrypt.checkpw
        val realHash = BCrypt.hashpw("senhaCorreta", BCrypt.gensalt())
        val mockUser = User(id = 1, username = "user", email = "certo@teste.com", passwordHash = realHash, role = UserRole.CLIMBER)

        `when`(userRepository.getUserByEmail("certo@teste.com")).thenReturn(mockUser)
        
        val token = userService.login("certo@teste.com", "senhaCorreta")

        assertNotNull(token)
        assertTrue(token.isNotEmpty())
    }
}