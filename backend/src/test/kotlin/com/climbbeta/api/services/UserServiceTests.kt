package com.climbbeta.api.services

import com.climbbeta.api.domain.ActivationCode
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.domain.UserStatus
import com.climbbeta.api.repository.ActivationCodeRepository
import com.climbbeta.api.repository.TokenRepository
import com.climbbeta.api.repository.UserRepository
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
import java.time.LocalDateTime

@ExtendWith(MockitoExtension::class)
class UserServiceTests {

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var tokenRepository: TokenRepository

    @Mock
    private lateinit var activationCodeRepository: ActivationCodeRepository

    private lateinit var userService: UserService

    @BeforeEach
    fun setup() {
        userService = UserService(userRepository, tokenRepository, activationCodeRepository)
    }

    @Test
    fun `createUser should fail when the password is too weak`() {
        // Validation runs before any repository access, so no stubbing is needed here.
        val exception = assertThrows<IllegalArgumentException> {
            userService.createUser("user1", "test@test.com", "weak", UserRole.CLIMBER)
        }
        assertTrue(exception.message!!.startsWith("Password must be"))
    }

    @Test
    fun `createUser should fail when the email already exists`() {
        `when`(userRepository.existsByEmail("test@test.com")).thenReturn(true)

        val exception = assertThrows<IllegalArgumentException> {
            userService.createUser("user1", "test@test.com", "Demo1234!", UserRole.CLIMBER)
        }
        assertEquals("This email is already registered!", exception.message)
    }

    @Test
    fun `createUser should create a user successfully`() {
        `when`(userRepository.existsByEmail("new@test.com")).thenReturn(false)
        `when`(userRepository.existsByUsername("new")).thenReturn(false)

        val expectedUser = User(id = 1, username = "new", email = "new@test.com", passwordHash = "hash", role = UserRole.CLIMBER)
        `when`(userRepository.createUser(any())).thenReturn(expectedUser)

        val result = userService.createUser("new", "new@test.com", "Demo1234!", UserRole.CLIMBER)

        assertEquals("new", result.username)
        assertEquals(1, result.id)
    }

    @Test
    fun `login should fail with invalid credentials`() {
        `when`(userRepository.getUserByEmail("wrong@test.com")).thenReturn(null)

        val exception = assertThrows<IllegalArgumentException> {
            userService.login("wrong@test.com", "Demo1234!")
        }
        assertEquals("Invalid credentials.", exception.message)
    }

    @Test
    fun `login should generate a token when the password is valid`() {
        val realHash = BCrypt.hashpw("CorrectPass1!", BCrypt.gensalt())
        val mockUser = User(id = 1, username = "user", email = "right@test.com", passwordHash = realHash, role = UserRole.CLIMBER)

        `when`(userRepository.getUserByEmail("right@test.com")).thenReturn(mockUser)

        val token = userService.login("right@test.com", "CorrectPass1!")

        assertNotNull(token)
        assertTrue(token.isNotEmpty())
    }

    @Test
    fun `verifyActivationCode should fail with an invalid code`() {
        `when`(activationCodeRepository.getByCode("invalid-code")).thenReturn(null)

        // A PENDING GYM_OWNER passes the first validations of the method
        val pendingOwner = User(id = 2, username = "owner", email = "o@test.com", passwordHash = "hash", role = UserRole.GYM_OWNER, status = UserStatus.PENDING)

        val exception = assertThrows<NoSuchElementException> {
            userService.verifyActivationCode(pendingOwner, "invalid-code")
        }
        assertEquals("Invalid activation code.", exception.message)
    }

    @Test
    fun `verifyActivationCode should fail with an already used code`() {
        val usedCode = ActivationCode(
            code = "used-code",
            isUsed = true,
            createdAt = LocalDateTime.now(),
            usedBy = 1
        )
        `when`(activationCodeRepository.getByCode("used-code")).thenReturn(usedCode)

        val pendingOwner = User(id = 2, username = "owner", email = "o@test.com", passwordHash = "hash", role = UserRole.GYM_OWNER, status = UserStatus.PENDING)

        val exception = assertThrows<IllegalArgumentException> {
            userService.verifyActivationCode(pendingOwner, "used-code")
        }
        assertEquals("This code has already been used.", exception.message)
    }
}
