package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.Ascent
import com.climbbeta.api.repository.AscentRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository
import java.time.LocalDate
import kotlin.collections.List
import com.climbbeta.api.domain.FeedItem
import java.sql.ResultSet


@Repository
class JdbiAscentRepository(private val jdbi: Jdbi) : AscentRepository {

    override fun create(
        climberId: Int, boulderId: Int?, outdoorRouteId: Int?,
        freelogGymName: String?, freelogGrade: String?,
        date: LocalDate, attempts: Int, style: String?, notes: String?
    ): Int {
        return jdbi.withHandle<Int, Exception> { handle ->
            handle.createUpdate("""
                INSERT INTO ascents (climber_id, boulder_id, outdoor_route_id, freelog_gym_name, freelog_grade, date, attempts, style, notes)
                VALUES (:climberId, :boulderId, :outdoorRouteId, :freelogGymName, :freelogGrade, :date, :attempts, :style, :notes)
            """)
                .bind("climberId", climberId)
                .bind("boulderId", boulderId)
                .bind("outdoorRouteId", outdoorRouteId)
                .bind("freelogGymName", freelogGymName)
                .bind("freelogGrade", freelogGrade)
                .bind("date", date)
                .bind("attempts", attempts)
                .bind("style", style)
                .bind("notes", notes)
                .executeAndReturnGeneratedKeys()
                .mapTo(Int::class.java)
                .one()
        }
    }

    override fun getByClimberId(climberId: Int): List<Ascent> {
        return jdbi.withHandle<List<Ascent>, Exception> { handle ->
            handle.createQuery("SELECT * FROM ascents WHERE climber_id = :climberId ORDER BY date DESC")
                .bind("climberId", climberId)
                .mapTo(Ascent::class.java)
                .list()
        }
    }

    override fun getById(id: Int): Ascent? {
        return jdbi.withHandle<Ascent?, Exception> { handle ->
            handle.createQuery("SELECT * FROM ascents WHERE id = :id")
                .bind("id", id)
                .mapTo(Ascent::class.java)
                .findOne().orElse(null)
        }
    }

    override fun delete(id: Int, climberId: Int): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            handle.createUpdate("DELETE FROM ascents WHERE id = :id AND climber_id = :climberId")
                .bind("id", id)
                .bind("climberId", climberId)
                .execute() > 0
        }
    }

    override fun getFeedForClimber(climberId: Int): List<FeedItem> {
        return jdbi.withHandle<List<FeedItem>, Exception> { handle ->
            handle.createQuery(
                """
                SELECT 
                    a.id, a.climber_id, a.boulder_id, a.outdoor_route_id,
                    a.freelog_gym_name, a.freelog_grade, a.date, a.attempts, a.style, a.notes,
                    u.username as author_username, 
                    cp.avatar_url as author_avatar,
                    COALESCE(m.media_url, b.image_url, g.cover_image_url) as post_image_url,
                    -- Puxar a Cor/Nome e o Grau reais da BD
                    COALESCE(b.color, o.name, 'Via Livre') as route_name,
                    COALESCE(b.grade, o.grade, a.freelog_grade) as route_grade
                FROM ascents a
                JOIN follows_climber f ON f.followed_id = a.climber_id
                JOIN users u ON u.id = a.climber_id
                LEFT JOIN climber_profiles cp ON cp.user_id = u.id
                LEFT JOIN media m ON m.ascent_id = a.id
                LEFT JOIN boulders b ON b.id = a.boulder_id
                LEFT JOIN outdoor_routes o ON o.id = a.outdoor_route_id -- JOIN adicionado
                LEFT JOIN gyms g ON g.id = b.gym_id
                WHERE f.follower_id = :climberId
                ORDER BY a.date DESC
                LIMIT 200
                """
            )
                .bind("climberId", climberId)
                .map { rs, _ ->
                    val ascent = Ascent(
                        id = rs.getInt("id"),
                        climberId = rs.getInt("climber_id"),
                        boulderId = rs.getObject("boulder_id")?.let { rs.getInt("boulder_id") },
                        outdoorRouteId = rs.getObject("outdoor_route_id")?.let { rs.getInt("outdoor_route_id") },
                        freelogGymName = rs.getString("freelog_gym_name"),
                        freelogGrade = rs.getString("freelog_grade"),
                        date = rs.getDate("date").toLocalDate(),
                        attempts = rs.getInt("attempts"),
                        style = rs.getString("style"),
                        notes = rs.getString("notes")
                    )
                    FeedItem(
                        ascent = ascent,
                        authorUsername = rs.getString("author_username"),
                        authorAvatarUrl = rs.getString("author_avatar"),
                        postImageUrl = rs.getString("post_image_url"),
                        routeName = rs.getString("route_name"),   // Mapeamento
                        routeGrade = rs.getString("route_grade")  // Mapeamento
                    )
                }
                .list()
        }
    }


}