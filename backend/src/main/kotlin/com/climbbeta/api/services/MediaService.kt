package com.climbbeta.api.services

import io.minio.MinioClient
import io.minio.PutObjectArgs
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@Service
class MediaService(
    private val minioClient: MinioClient,
    @Value("\${minio.endpoint}") private val endpoint: String,
    @Value("\${minio.public-url}") private val publicUrl: String,
    @Value("\${minio.bucket-name}") private val bucketName: String
) {
    fun uploadMedia(file: MultipartFile): String {
        try {
            // Extrair a extensão original do ficheiro (ex: .png, .jpg)
            val originalFilename = file.originalFilename ?: "unknown"
            val extension = originalFilename.substringAfterLast('.', "")

            // Gerar um nome único e seguro (ex: 123e4567-e89b-12d3-a456-426614174000.jpg)
            val fileName = if (extension.isNotEmpty()) {
                "${UUID.randomUUID()}.$extension"
            } else {
                UUID.randomUUID().toString()
            }

            val inputStream = file.inputStream

            // Fazer o upload do fluxo de bytes para o MinIO
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .`object`(fileName)
                    .stream(inputStream, file.size, -1)
                    .contentType(file.contentType ?: "application/octet-stream")
                    .build()
            )

            // Construir e devolver o URL público para guardar no PostgreSQL
            return "$publicUrl/$bucketName/$fileName"

        } catch (e: Exception) {
            // Lançar exceção para ser apanhada pelo ExceptionHandler global ou Controller
            throw RuntimeException("Falha ao fazer upload do ficheiro multimédia: ${e.message}", e)
        }
    }
}