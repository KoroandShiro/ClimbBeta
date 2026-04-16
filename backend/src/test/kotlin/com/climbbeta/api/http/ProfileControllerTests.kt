package com.climbbeta.api.http

import com.climbbeta.api.domain.ClimberProfile
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
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
    private lateinit var request: HttpServletRequest

    @InjectMocks
    private lateinit var profileController: ProfileController

    @Test
    fun `getMyProfile deve retornar 403 se o user nao for CLIMBER`() {
        val ownerUser = User(id = 1, username = "owner", email = "test", passwordHash = "h", role = UserRole.GYM_OWNER)
        whenever(request.getAttribute("authenticatedUser")).thenReturn(ownerUser)

        val response = profileController.getMyProfile(request)

        assertEquals(HttpStatus.FORBIDDEN, response.statusCode)
    }

    @Test
    fun `getMyProfile deve retornar perfil se for CLIMBER`() {
        val climberUser = User(id = 1, username = "climber", email = "test", passwordHash = "h", role = UserRole.CLIMBER)
        val profile = ClimberProfile(userId = 1, bio = "Bio ok", height = 180, apeIndex = 1.0)
        
        whenever(request.getAttribute("authenticatedUser")).thenReturn(climberUser)
        whenever(profileService.getClimberProfile(1)).thenReturn(profile)

        val response = profileController.getMyProfile(request)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(profile, response.body)
    }

    @Test
    fun `updateMyProfile deve retornar 403 se o user nao for CLIMBER`() {
        val adminUser = User(id = 1, username = "admin", email = "test", passwordHash = "h", role = UserRole.ADMIN)
        whenever(request.getAttribute("authenticatedUser")).thenReturn(adminUser)

        val response = profileController.updateMyProfile(ProfileUpdateInput("Bio", 185, null), request)

        assertEquals(HttpStatus.FORBIDDEN, response.statusCode)
    }
}