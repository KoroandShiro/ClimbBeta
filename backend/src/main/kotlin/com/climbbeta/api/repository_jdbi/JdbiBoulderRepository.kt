package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.domain.LeaderboardEntry
import com.climbbeta.api.repository.BoulderRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository
import java.time.LocalDate

/**
 * JDBI implementation of the [BoulderRepository].
 *
 * Directs individual indoor commercial setting indices and processes analytic query data structures
 * to compute competitive boulder rankings.
 */
@Repository
class JdbiBoulderRepository(private val jdbi: Jdbi) : BoulderRepository {

    override fun createBoulder(boulder: Boulder): Boulder {
        return jdbi.withHandle<Boulder, Exception> { handle ->
            val id = handle.createUpdate(
                """
                INSERT INTO boulders (gym_id, color, hex_color, grade, setter_name, set_date, is_active, image_url)
                VALUES (:gymId, :color, :hexColor, :grade, :setterName, :setDate, :isActive, :imageUrl)
                """
            )
                .bind("gymId", boulder.gymId)
                .bind("color", boulder.color)
                .bind("hexColor", boulder.hexColor)
                .bind("grade", boulder.grade)
                .bind("setterName", boulder.setterName)
                .bind("setDate", boulder.setDate)
                .bind("isActive", boulder.isActive)
                .bind("imageUrl", boulder.imageUrl)
                .executeAndReturnGeneratedKeys("id")
                .mapTo(Int::class.java)
                .one()

            boulder.copy(id = id)
        }
    }

    /**
     * Collects all active boulder tracks configured inside a commercial facility.
     */
    override fun getBouldersByGymId(gymId: Int): List<Boulder> {
        return jdbi.withHandle<List<Boulder>, Exception> { handle ->
            handle.createQuery(
                """
                SELECT id, gym_id AS gymId, color, hex_color AS hexColor, grade, 
                       setter_name AS setterName, set_date AS setDate, 
                       is_active AS isActive, image_url AS imageUrl
                FROM boulders
                WHERE gym_id = :gymId AND is_active = true
                ORDER BY set_date DESC
                """
            )
                .bind("gymId", gymId)
                .mapTo(Boulder::class.java)
                .list()
        }
    }

    override fun getBoulderById(id: Int): Boulder? {
        return jdbi.withHandle<Boulder?, Exception> { handle ->
            handle.createQuery(
                """
                SELECT id, gym_id AS gymId, color, hex_color AS hexColor, grade, 
                       setter_name AS setterName, set_date AS setDate, 
                       is_active AS isActive, image_url AS imageUrl
                FROM boulders
                WHERE id = :id
                """
            )
                .bind("id", id)
                .mapTo(Boulder::class.java)
                .findOne()
                .orElse(null)
        }
    }

    override fun updateBoulderStatus(id: Int, isActive: Boolean): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            val rows = handle.createUpdate("UPDATE boulders SET is_active = :isActive WHERE id = :id")
                .bind("id", id)
                .bind("isActive", isActive)
                .execute()
            rows > 0
        }
    }

    /**
     * Compiles an analytical performance scoreboard for a specific boulder track.
     *
     * Uses a `ROW_NUMBER() OVER` window function grouping performance metrics per climber.
     * Performance priority ranks clean completion send styles over absolute attempt counts:
     * 1. Flash
     * 2. Onsight
     * 3. Redpoint / Base Sent
     */
    override fun getLeaderboard(boulderId: Int): List<LeaderboardEntry> {
        return jdbi.withHandle<List<LeaderboardEntry>, Exception> { handle ->
            handle.createQuery(
                """
                SELECT 
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            CASE WHEN MIN(a.style) = 'Flash' THEN 1 
                                 WHEN MIN(a.style) = 'Onsight' THEN 2 
                                 ELSE 3 END,
                            MIN(a.attempts) ASC
                    ) as rank,
                    a.climber_id as climber_id,
                    u.username,
                    cp.avatar_url,
                    MIN(a.style) as style,
                    MIN(a.attempts) as attempts,
                    MAX(a.date) as date
                FROM ascents a
                JOIN climber_profiles cp ON cp.user_id = a.climber_id
                JOIN users u ON u.id = a.climber_id
                WHERE a.boulder_id = :boulderId
                GROUP BY a.climber_id, u.username, cp.avatar_url
                ORDER BY 
                    CASE WHEN MIN(a.style) = 'Flash' THEN 1 
                         WHEN MIN(a.style) = 'Onsight' THEN 2 
                         ELSE 3 END,
                    MIN(a.attempts) ASC
                """
            )
                .bind("boulderId", boulderId)
                .map { rs, _ ->
                    LeaderboardEntry(
                        rank = rs.getInt("rank"),
                        climberId = rs.getInt("climber_id"),
                        username = rs.getString("username"),
                        avatarUrl = rs.getString("avatar_url"),
                        style = rs.getString("style") ?: "project",
                        attempts = rs.getInt("attempts"),
                        date = rs.getObject("date", LocalDate::class.java)
                    )
                }
                .list()
        }
    }
}