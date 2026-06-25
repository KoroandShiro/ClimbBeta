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
            // Extract original file extension (e.g., .png, .jpg)
            val originalFilename = file.originalFilename ?: "unknown"
            val extension = originalFilename.substringAfterLast('.', "")

            // Generate a unique and secure filename (e.g., 123e4567-e89b-12d3-a456-426614174000.jpg)
            val fileName = if (extension.isNotEmpty()) {
                "${UUID.randomUUID()}.$extension"
            } else {
                UUID.randomUUID().toString()
            }

            val inputStream = file.inputStream

            // Upload the byte stream to MinIO
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .`object`(fileName)
                    .stream(inputStream, file.size, -1)
                    .contentType(file.contentType ?: "application/octet-stream")
                    .build()
            )

            // Construct and return the public URL to be stored in PostgreSQL
            return "$publicUrl/$bucketName/$fileName"

        } catch (e: Exception) {
            // Throw exception to be caught by the global ExceptionHandler or Controller
            throw RuntimeException("Failed to upload media file: ${e.message}", e)
        }
    }
}