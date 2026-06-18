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
    private val minioClient: MinioClient // 🆕 Injeta o cliente do MinIO aqui
) {
    fun getClimberProfile(userId: Int): ClimberProfile {
        return profileRepository.getClimberProfile(userId)
            ?: throw IllegalArgumentException("Perfil não encontrado.")
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
            avatarUrl = profile.avatarUrl // 🆕 corrigido de 'null' para 'profile.avatarUrl'!
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

    // 🆕 Adiciona a função que vai fazer a ponte com o teu MinIO dockerizado
    fun updateClimberAvatar(userId: Int, file: MultipartFile): String {
        val bucketName = "climbbeta-media"

        // 1. Criar um nome de ficheiro único para evitar substituições acidentais
        val fileName = "$userId-${UUID.randomUUID()}-${file.originalFilename}"

        // 2. Enviar o stream da imagem diretamente para o MinIO
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

        // 3. Gerar o URL público usando o IP da tua máquina para o telemóvel conseguir aceder
        val avatarUrl = "http://192.168.1.141:9000/$bucketName/$fileName"

        // 4. Atualizar o registo no PostgreSQL usando o métdo novo do JdbiProfileRepository
        profileRepository.updateAvatarUrl(userId, avatarUrl)

        return avatarUrl
    }
}