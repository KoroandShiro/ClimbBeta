package com.climbbeta.api.repository

import com.climbbeta.api.domain.OutdoorRoute

interface OutdoorRouteRepository {
    fun create(creatorId: Int, name: String?, sector: String, location: String, grade: String): Int
    fun getAll(): List<OutdoorRoute>
    fun getById(id: Int): OutdoorRoute?

    /**
     * Finds an outdoor route that already matches the given descriptors, so a repeated free log
     * of the same crag reuses the existing row instead of creating a duplicate.
     */
    fun findExisting(name: String?, sector: String, location: String, grade: String): OutdoorRoute?
}