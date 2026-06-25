package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.repository.LikeRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository

/**
 * JDBI implementation of the [LikeRepository].
 *
 * Governs social reaction indices linked to user-submitted ascent elements.
 */
@Repository
class JdbiLikeRepository(private val jdbi: Jdbi) : LikeRepository {

    /**
     * Flags an interaction index between a climber session and an activity post.
     * Employs `ON CONFLICT DO NOTHING` to swallow redundant duplicate triggers gracefully.
     */
    override fun like(climberId: Int, ascentId: Int): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            val updated = handle.createUpdate(
                """
                INSERT INTO likes (climber_id, ascent_id)
                VALUES (:climberId, :ascentId)
                ON CONFLICT DO NOTHING
                """
            )
                .bind("climberId", climberId)
                .bind("ascentId", ascentId)
                .execute()
            updated > 0
        }
    }

    override fun unlike(climberId: Int, ascentId: Int): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            handle.createUpdate(
                "DELETE FROM likes WHERE climber_id = :climberId AND ascent_id = :ascentId"
            )
                .bind("climberId", climberId)
                .bind("ascentId", ascentId)
                .execute() > 0
        }
    }

    override fun isLiked(climberId: Int, ascentId: Int): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            val count = handle.createQuery(
                "SELECT COUNT(1) FROM likes WHERE climber_id = :climberId AND ascent_id = :ascentId"
            )
                .bind("climberId", climberId)
                .bind("ascentId", ascentId)
                .mapTo(Int::class.java)
                .one()
            count > 0
        }
    }

    override fun getLikeCount(ascentId: Int): Int {
        return jdbi.withHandle<Int, Exception> { handle ->
            handle.createQuery(
                "SELECT COUNT(1) FROM likes WHERE ascent_id = :ascentId"
            )
                .bind("ascentId", ascentId)
                .mapTo(Int::class.java)
                .one()
        }
    }
}