package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.repository.MediaRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository

/**
 * JDBI implementation of the [MediaRepository].
 *
 * Writes a row into the `media` table. The `media_type` enum is cast in SQL (`:mediaType::media_type`),
 * the same pattern used for `user_role`/`user_status` in [JdbiUserRepository].
 */
@Repository
class JdbiMediaRepository(private val jdbi: Jdbi) : MediaRepository {

    override fun create(uploaderId: Int, ascentId: Int, mediaUrl: String, mediaType: String): Int {
        return jdbi.withHandle<Int, Exception> { handle ->
            handle.createUpdate(
                """
                INSERT INTO media (uploader_id, ascent_id, media_url, media_type)
                VALUES (:uploaderId, :ascentId, :mediaUrl, :mediaType::media_type)
                """
            )
                .bind("uploaderId", uploaderId)
                .bind("ascentId", ascentId)
                .bind("mediaUrl", mediaUrl)
                .bind("mediaType", mediaType)
                .executeAndReturnGeneratedKeys("id")
                .mapTo(Int::class.java)
                .one()
        }
    }
}
