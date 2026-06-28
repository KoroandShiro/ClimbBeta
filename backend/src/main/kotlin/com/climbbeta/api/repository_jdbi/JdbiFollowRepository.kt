package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.ClimberSummary
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

    /** Reuses the same `EXISTS(... :viewerId ...) AS isFollowing` pattern as user search. */
    override fun getFollowers(userId: Int, viewerId: Int): List<ClimberSummary> {
        return jdbi.withHandle<List<ClimberSummary>, Exception> { handle ->
            handle.createQuery(
                """
                SELECT u.id, u.username,
                       cp.avatar_url AS avatarUrl,
                       EXISTS(SELECT 1 FROM follows_climber x WHERE x.follower_id = :viewerId AND x.followed_id = u.id) AS isFollowing
                FROM follows_climber f
                JOIN users u ON u.id = f.follower_id
                LEFT JOIN climber_profiles cp ON cp.user_id = u.id
                WHERE f.followed_id = :userId
                ORDER BY u.username
                """
            )
                .bind("userId", userId)
                .bind("viewerId", viewerId)
                .mapTo(ClimberSummary::class.java)
                .list()
        }
    }

    override fun getFollowing(userId: Int, viewerId: Int): List<ClimberSummary> {
        return jdbi.withHandle<List<ClimberSummary>, Exception> { handle ->
            handle.createQuery(
                """
                SELECT u.id, u.username,
                       cp.avatar_url AS avatarUrl,
                       EXISTS(SELECT 1 FROM follows_climber x WHERE x.follower_id = :viewerId AND x.followed_id = u.id) AS isFollowing
                FROM follows_climber f
                JOIN users u ON u.id = f.followed_id
                LEFT JOIN climber_profiles cp ON cp.user_id = u.id
                WHERE f.follower_id = :userId
                ORDER BY u.username
                """
            )
                .bind("userId", userId)
                .bind("viewerId", viewerId)
                .mapTo(ClimberSummary::class.java)
                .list()
        }
    }
}