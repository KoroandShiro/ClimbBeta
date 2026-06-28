package com.climbbeta.api.services

import com.climbbeta.api.domain.ClimberProfile
import com.climbbeta.api.repository.ProfileRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import com.climbbeta.api.domain.ClimberProfileWithUserDTO
import com.climbbeta.api.domain.User
import io.minio.MinioClient
import io.minio.PutObjectArgs
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

/**
 * Service managing individual climber characteristics, metrics, and profile metadata.
 *
 * Oversees physical parameters (height, ape-index) and manages cloud interactions
 * to handle custom profile avatar media assets.
 */
@Service
class ProfileService(
    private val profileRepository: ProfileRepository,
    private val minioClient: MinioClient,
    @Value("\${minio.public-url}") private val publicUrl: String,
    @Value("\${minio.bucket-name}") private val bucketName: String
) {
    fun getClimberProfile(userId: Int): ClimberProfile {
        return profileRepository.getClimberProfile(userId)
            ?: throw IllegalArgumentException("Profile not found.")
    }

    /**
     * Aggregates base authentication credentials with custom physical attributes
     * to compile a consolidated, presentation-ready DTO view.
     */
    fun getClimberProfileWithUser(userId: Int, user: User): ClimberProfileWithUserDTO {
        val profile = getClimberProfile(userId)
        return ClimberProfileWithUserDTO(
            userId = profile.userId, username = user.username, email = user.email,
            bio = profile.bio, height = profile.height, apeIndex = profile.apeIndex,
            avatarUrl = profile.avatarUrl
        )
    }

    fun updateClimberProfile(userId: Int, bio: String?, height: Int?, apeIndex: Double?) {
        val updatedProfile = ClimberProfile(
            userId = userId, bio = bio, height = height, apeIndex = apeIndex
        )
        profileRepository.updateClimberProfile(updatedProfile)
    }

    /**
     * Streams a profile image directly to MinIO and links the generated public path to the user's profile.
     *
     * Combines binary file handling, unique name generation to avoid data overrides,
     * and a final transactional database update.
     *
     * @param userId Primary key of the target climber profile.
     * @param file Raw multipart upload image token.
     * @return Accessible dynamic public asset network identifier route string.
     */
    fun updateClimberAvatar(userId: Int, file: MultipartFile): String {
        val fileName = "$userId-${UUID.randomUUID()}-${file.originalFilename}"

        file.inputStream.use { inputStream ->
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .`object`(fileName)
                    .stream(inputStream, file.size, -1)
                    .contentType(file.contentType)
                    .build()
            )
        }

        val avatarUrl = "$publicUrl/$bucketName/$fileName"
        profileRepository.updateAvatarUrl(userId, avatarUrl)

        return avatarUrl
    }
}