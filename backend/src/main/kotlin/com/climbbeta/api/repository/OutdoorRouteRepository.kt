package com.climbbeta.api.repository

import com.climbbeta.api.domain.OutdoorRoute

interface OutdoorRouteRepository {
    fun create(creatorId: Int, name: String?, sector: String, location: String, grade: String): Int
    fun getAll(): List<OutdoorRoute>
    fun getById(id: Int): OutdoorRoute?
}