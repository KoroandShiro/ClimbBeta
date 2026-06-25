package com.climbbeta.api.services

import com.climbbeta.api.domain.ClimberProfile
import com.climbbeta.api.repository.ProfileRepository
import org.springframework.stereotype.Service
import com.climbbeta.api.domain.ClimberProfileWithUserDTO
import com.climbbeta.api.domain.User
import io.minio.MinioClient
import io.minio.PutObjectArgs
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@Service
class ProfileService(
    private val profileRepository: ProfileRepository,
    private val minioClient: MinioClient // 🆕 Inject MinIO client here
) {
    fun getClimberProfile(userId: Int): ClimberProfile {
        return profileRepository.getClimberProfile(userId)
            ?: throw IllegalArgumentException("Profile not found.")
    }

    fun getClimberProfileWithUser(userId: Int, user: User): ClimberProfileWithUserDTO {
        val profile = getClimberProfile(userId)
        return ClimberProfileWithUserDTO(
            userId = profile.userId,
            username = user.username,
            email = user.email,
            bio = profile.bio,
            height = profile.height,
            apeIndex = profile.apeIndex,
            avatarUrl = profile.avatarUrl // 🆕 fixed from 'null' to 'profile.avatarUrl'!
        )
    }

    fun updateClimberProfile(userId: Int, bio: String?, height: Int?, apeIndex: Double?) {
        val updatedProfile = ClimberProfile(
            userId = userId,
            bio = bio,
            height = height,
            apeIndex = apeIndex
        )
        profileRepository.updateClimberProfile(updatedProfile)
    }

    // 🆕 Adds the bridging function to communicate with your Dockerized MinIO instance
    fun updateClimberAvatar(userId: Int, file: MultipartFile): String {
        val bucketName = "climbbeta-media"

        // 1. Create a unique filename to prevent accidental overrides
        val fileName = "$userId-${UUID.randomUUID()}-${file.originalFilename}"

        // 2. Stream the image data directly to MinIO
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

        // 3. Generate public URL using your host IP so the mobile device can access it
        val avatarUrl = "http://192.168.1.141:9000/$bucketName/$fileName"

        // 4. Update the record in PostgreSQL using the new method from JdbiProfileRepository
        profileRepository.updateAvatarUrl(userId, avatarUrl)

        return avatarUrl
    }
}