package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.repository.FollowRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository

/**
 * JDBI implementation of the [FollowRepository].
 *
 * Resolves community subscription maps and profiles linkage, handling network bounds.
 */
@Repository
class JdbiFollowRepository(private val jdbi: Jdbi) : FollowRepository {

    /**
     * Subscribes a user session to a target profile's public activity timeline.
     * Blocks self-subscription actions and uses `ON CONFLICT DO NOTHING` to prevent key duplication.
     */
    override fun follow(followerId: Int, followedId: Int): Boolean {
        if (followerId == followedId) {
            return false
        }
        return jdbi.withHandle<Boolean, Exception> { handle ->
            val updated = handle.createUpdate(
                """
                INSERT INTO follows_climber (follower_id, followed_id)
                VALUES (:followerId, :followedId)
                ON CONFLICT DO NOTHING
                """
            )
                .bind("followerId", followerId)
                .bind("followedId", followedId)
                .execute()
            updated > 0
        }
    }

    override fun unfollow(followerId: Int, followedId: Int): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            handle.createUpdate(
                "DELETE FROM follows_climber WHERE follower_id = :followerId AND followed_id = :followedId"
            )
                .bind("followerId", followerId)
                .bind("followedId", followedId)
                .execute() > 0
        }
    }

    override fun isFollowing(followerId: Int, followedId: Int): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            val count = handle.createQuery(
                "SELECT COUNT(1) FROM follows_climber WHERE follower_id = :followerId AND followed_id = :followedId"
            )
                .bind("followerId", followerId)
                .bind("followedId", followedId)
                .mapTo(Int::class.java)
                .one()
            count > 0
        }
    }

    override fun getFollowersCount(userId: Int): Int {
        return jdbi.withHandle<Int, Exception> { handle ->
            handle.createQuery(
                "SELECT COUNT(1) FROM follows_climber WHERE followed_id = :userId"
            )
                .bind("userId", userId)
                .mapTo(Int::class.java)
                .one()
        }
    }

    override fun getFollowingCount(userId: Int): Int {
        return jdbi.withHandle<Int, Exception> { handle ->
            handle.createQuery(
                "SELECT COUNT(1) FROM follows_climber WHERE follower_id = :userId"
            )
                .bind("userId", userId)
                .mapTo(Int::class.java)
                .one()
        }
    }
}