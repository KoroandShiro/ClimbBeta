package com.climbbeta.api.http

import com.climbbeta.api.domain.ClimberProfileWithUserDTO
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.repository.UserRepository
import com.climbbeta.api.repository_jdbi.JdbiSaveRepository
import com.climbbeta.api.services.ProfileService
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus

@ExtendWith(MockitoExtension::class)
class ProfileControllerTests {

    @Mock
    private lateinit var profileService: ProfileService

    @Mock
    private lateinit var saveRepository: JdbiSaveRepository

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var request: HttpServletRequest

    @InjectMocks
    private lateinit var profileController: ProfileController

    @Test
    fun `getMyProfile should return 403 when the user is not a CLIMBER`() {
        val ownerUser = User(id = 1, username = "owner", email = "test", passwordHash = "h", role = UserRole.GYM_OWNER)
        whenever(request.getAttribute("authenticatedUser")).thenReturn(ownerUser)

        val response = profileController.getMyProfile(request)

        assertEquals(HttpStatus.FORBIDDEN, response.statusCode)
    }

    @Test
    fun `getMyProfile should return the profile when the user is a CLIMBER`() {
        val climberUser = User(id = 1, username = "climber", email = "test", passwordHash = "h", role = UserRole.CLIMBER)
        val profile = ClimberProfileWithUserDTO(
            userId = 1, username = "climber", email = "test",
            bio = "Bio ok", height = 180, apeIndex = 1.0
        )

        whenever(request.getAttribute("authenticatedUser")).thenReturn(climberUser)
        whenever(profileService.getClimberProfileWithUser(1, climberUser)).thenReturn(profile)

        val response = profileController.getMyProfile(request)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(profile, response.body)
    }

    @Test
    fun `updateMyProfile should return 403 when the user is not a CLIMBER`() {
        val adminUser = User(id = 1, username = "admin", email = "test", passwordHash = "h", role = UserRole.ADMIN)
        whenever(request.getAttribute("authenticatedUser")).thenReturn(adminUser)

        val response = profileController.updateMyProfile(
            ProfileUpdateInput(username = null, bio = "Bio", height = 185, apeIndex = null), request
        )

        assertEquals(HttpStatus.FORBIDDEN, response.statusCode)
    }
}
