package com.climbbeta.api.services

import com.climbbeta.api.domain.OutdoorRoute
import com.climbbeta.api.repository.OutdoorRouteRepository
import org.springframework.stereotype.Service

/**
 * Service managing user-curated outdoor route indexes (crags/sectors).
 *
 * Provides operations to list and submit real-world climbing crags,
 * independent from commercial indoor facilities.
 */
@Service
class OutdoorRouteService(
    private val outdoorRouteRepository: OutdoorRouteRepository
) {
    /**
     * Logs a newly discovered or cleared outdoor sport/boulder route.
     *
     * @param creatorId The account ID reporting the entry.
     * @return Generated primary key index assigned by the database storage layer.
     */
    fun createRoute(creatorId: Int, name: String?, sector: String, location: String, grade: String): Int {
        return outdoorRouteRepository.create(creatorId, name, sector, location, grade)
    }

    fun getAllRoutes(): List<OutdoorRoute> = outdoorRouteRepository.getAll()

    fun getRouteById(id: Int): OutdoorRoute? = outdoorRouteRepository.getById(id)
}