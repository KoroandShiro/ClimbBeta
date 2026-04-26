package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.Ascent
import com.climbbeta.api.repository.AscentRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository
import java.time.LocalDate

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

    override fun delete(id: Int, climberId: Int): Boolean {
        return jdbi.withHandle<Boolean, Exception> { handle ->
            handle.createUpdate("DELETE FROM ascents WHERE id = :id AND climber_id = :climberId")
                .bind("id", id)
                .bind("climberId", climberId)
                .execute() > 0
        }
    }
}