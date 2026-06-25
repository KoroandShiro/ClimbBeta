package com.climbbeta.api.services

import io.minio.MinioClient
import io.minio.PutObjectArgs
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

/**
 * Infrastructure storage bridge wrapper managing asset distribution on a cluster storage.
 *
 * Connects directly to localized MinIO object cloud environments to dispatch incoming binary
 * byte streams, generating universally unique resource locators (URLs).
 */
@Service
class MediaService(
    private val minioClient: MinioClient,
    @Value("\${minio.endpoint}") private val endpoint: String,
    @Value("\${minio.public-url}") private val publicUrl: String,
    @Value("\${minio.bucket-name}") private val bucketName: String
) {
    /**
     * Dispatches a raw HTTP multipart file into the configured MinIO bucket.
     *
     * Automatically randomizes object references using standard secure UUID tokens
     * while preserving explicit original extension tags (.jpg, .png).
     *
     * @param file Incoming raw multipart multi-byte wrapper structure.
     * @return Absolute accessible public URL target string mapped to the cluster network.
     * @throws RuntimeException If streaming handshakes fail during transfer phases.
     */
    fun uploadMedia(file: MultipartFile): String {
        try {
            val originalFilename = file.originalFilename ?: "unknown"
            val extension = originalFilename.substringAfterLast('.', "")

            val fileName = if (extension.isNotEmpty()) {
                "${UUID.randomUUID()}.$extension"
            } else {
                UUID.randomUUID().toString()
            }

            val inputStream = file.inputStream

            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .`object`(fileName)
                    .stream(inputStream, file.size, -1)
                    .contentType(file.contentType ?: "application/octet-stream")
                    .build()
            )

            return "$publicUrl/$bucketName/$fileName"

        } catch (e: Exception) {
            throw RuntimeException("Failed to upload media file: ${e.message}", e)
        }
    }
}