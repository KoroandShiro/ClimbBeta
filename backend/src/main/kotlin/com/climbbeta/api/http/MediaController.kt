package com.climbbeta.api.http

import com.climbbeta.api.services.MediaService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

/**
 * REST Gateway handling general binary media uploads.
 *
 * Interacts directly with MinIO storage providers to host images before saving references in PostgreSQL.
 */
@RestController
@RequestMapping("/media")
class MediaController(
    private val mediaService: MediaService
) {
    /**
     * Receives and processes a multipart binary file upload.
     *
     * @return Absolute asset link target path with status 200 (OK), or 400 if empty.
     */
    @PostMapping("/upload")
    fun uploadMedia(@RequestParam("file") file: MultipartFile): ResponseEntity<Map<String, String>> {
        if (file.isEmpty) {
            return ResponseEntity.badRequest().body(mapOf("error" to "The submitted file is empty."))
        }

        // Uma falha do MinIO (RuntimeException no MediaService) propaga-se até ao
        // GlobalExceptionHandler, que devolve 500 em JSON (nunca HTML).
        val fileUrl = mediaService.uploadMedia(file)
        return ResponseEntity.ok(mapOf("url" to fileUrl))
    }
}