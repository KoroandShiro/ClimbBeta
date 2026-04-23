package com.climbbeta.api.repository_jdbi

import com.climbbeta.api.domain.OutdoorRoute
import com.climbbeta.api.repository.OutdoorRouteRepository
import org.jdbi.v3.core.Jdbi
import org.springframework.stereotype.Repository

@Repository
class JdbiOutdoorRouteRepository(
    private val jdbi: Jdbi
) : OutdoorRouteRepository {

    override fun create(creatorId: Int, name: String?, sector: String, location: String, grade: String): Int {
        return jdbi.withHandle<Int, Exception> { handle ->
            handle.createUpdate(
                """
                INSERT INTO outdoor_routes (creator_id, name, sector, location, grade)
                VALUES (:creatorId, :name, :sector, :location, :grade)
                """
            )
                .bind("creatorId", creatorId)
                .bind("name", name)
                .bind("sector", sector)
                .bind("location", location)
                .bind("grade", grade)
                .executeAndReturnGeneratedKeys()
                .mapTo(Int::class.java)
                .one()
        }
    }

    override fun getAll(): List<OutdoorRoute> {
        return jdbi.withHandle<List<OutdoorRoute>, Exception> { handle ->
            handle.createQuery("SELECT * FROM outdoor_routes")
                .mapTo(OutdoorRoute::class.java)
                .list()
        }
    }

    override fun getById(id: Int): OutdoorRoute? {
        return jdbi.withHandle<OutdoorRoute?, Exception> { handle ->
            handle.createQuery("SELECT * FROM outdoor_routes WHERE id = :id")
                .bind("id", id)
                .mapTo(OutdoorRoute::class.java)
                .findOne()
                .orElse(null)
        }
    }
}