package com.climbbeta.api.services

import com.climbbeta.api.domain.OutdoorRoute
import com.climbbeta.api.repository.OutdoorRouteRepository
import org.springframework.stereotype.Service

@Service
class OutdoorRouteService(
    private val outdoorRouteRepository: OutdoorRouteRepository
) {
    fun createRoute(creatorId: Int, name: String?, sector: String, location: String, grade: String): Int {
        return outdoorRouteRepository.create(creatorId, name, sector, location, grade)
    }

    fun getAllRoutes(): List<OutdoorRoute> {
        return outdoorRouteRepository.getAll()
    }

    fun getRouteById(id: Int): OutdoorRoute? {
        return outdoorRouteRepository.getById(id)
    }
}