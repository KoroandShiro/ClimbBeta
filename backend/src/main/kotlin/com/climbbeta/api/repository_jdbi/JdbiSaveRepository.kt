package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.repository.SaveRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
class JdbiSaveRepository(private val jdbi: Jdbi) : SaveRepository {

    override fun save(climberId: Int, boulderId: Int): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            val updated = handle.createUpdate(
                """
                INSERT INTO saves_project (climber_id, boulder_id)
                VALUES (:climberId, :boulderId)
                ON CONFLICT DO NOTHING
                """
            )
                .bind("climberId", climberId)
                .bind("boulderId", boulderId)
                .execute()
            updated > 0
        }
    }

    override fun unsave(climberId: Int, boulderId: Int): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            handle.createUpdate(
                "DELETE FROM saves_project WHERE climber_id = :climberId AND boulder_id = :boulderId"
            )
                .bind("climberId", climberId)
                .bind("boulderId", boulderId)
                .execute() > 0
        }
    }

    override fun isSaved(climberId: Int, boulderId: Int): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            val count = handle.createQuery(
                "SELECT COUNT(1) FROM saves_project WHERE climber_id = :climberId AND boulder_id = :boulderId"
            )
                .bind("climberId", climberId)
                .bind("boulderId", boulderId)
                .mapTo(Int::class.java)
                .one()
            count > 0
        }
    }

    override fun getSavedBoulders(climberId: Int): List<Boulder> {
        return jdbi.withHandle<List<Boulder>, Exception> { handle ->
            handle.createQuery(
                """
                SELECT 
                    b.id, b.gym_id, b.color, b.hex_color, b.grade, b.setter_name, 
                    b.set_date, b.is_active, b.image_url
                FROM boulders b
                JOIN saves_project sp ON sp.boulder_id = b.id
                WHERE sp.climber_id = :climberId
                ORDER BY sp.saved_at DESC
                """
            )
                .bind("climberId", climberId)
                .map { rs, _ ->
                    Boulder(
                        id = rs.getInt("id"),
                        gymId = rs.getInt("gym_id"),
                        color = rs.getString("color"),
                        hexColor = rs.getString("hex_color"),
                        grade = rs.getString("grade"),
                        setterName = rs.getString("setter_name"),
                        setDate = rs.getObject("set_date", LocalDate::class.java),
                        isActive = rs.getBoolean("is_active"),
                        imageUrl = rs.getString("image_url")
                    )
                }
                .list()
        }
    }
}
