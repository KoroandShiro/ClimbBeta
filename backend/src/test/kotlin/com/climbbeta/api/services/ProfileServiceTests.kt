package com.climbbeta.api.services

import com.climbbeta.api.domain.ClimberProfile
import com.climbbeta.api.repository.AscentRepository
import com.climbbeta.api.repository.FollowRepository
import com.climbbeta.api.repository.ProfileRepository
import io.minio.MinioClient
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class ProfileServiceTests {

    @Mock
    private lateinit var profileRepository: ProfileRepository

    @Mock
    private lateinit var followRepository: FollowRepository

    @Mock
    private lateinit var ascentRepository: AscentRepository

    @Mock
    private lateinit var minioClient: MinioClient

    private lateinit var profileService: ProfileService

    @BeforeEach
    fun setup() {
        profileService = ProfileService(
            profileRepository, followRepository, ascentRepository, minioClient,
            publicUrl = "http://localhost:9000", bucketName = "test-bucket"
        )
    }

    @Test
    fun `getClimberProfile should fail when the user has no registered profile`() {
        `when`(profileRepository.getClimberProfile(99)).thenReturn(null)

        val ex = assertThrows<IllegalArgumentException> {
            profileService.getClimberProfile(99)
        }
        assertEquals("Profile not found.", ex.message)
    }

    @Test
    fun `updateClimberProfile should call the repository correctly`() {
        profileService.updateClimberProfile(1, "New Bio", 180, 1.02)

        // Verifies the repository received an object with the correct values
        val expectedProfile = ClimberProfile(userId = 1, bio = "New Bio", height = 180, apeIndex = 1.02)
        verify(profileRepository).updateClimberProfile(expectedProfile)
    }
}
