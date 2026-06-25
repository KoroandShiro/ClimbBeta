package com.climbbeta.api.http

import com.climbbeta.api.services.MediaService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/media")
class MediaController(
    private val mediaService: MediaService
) {
    @PostMapping("/upload")
    fun uploadMedia(@RequestParam("file") file: MultipartFile): ResponseEntity<Map<String, String>> {
        if (file.isEmpty) {
            return ResponseEntity.badRequest().body(mapOf("error" to "The submitted file is empty."))
        }

        return try {
            val fileUrl = mediaService.uploadMedia(file)
            ResponseEntity.ok(mapOf("url" to fileUrl))
        } catch (e: Exception) {
            ResponseEntity.internalServerError().body(mapOf("error" to (e.message ?: "Internal server error")))
        }
    }
}