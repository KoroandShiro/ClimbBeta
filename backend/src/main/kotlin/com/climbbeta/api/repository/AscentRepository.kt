package com.climbbeta.api.repository

import com.climbbeta.api.domain.Ascent
import java.time.LocalDate

interface AscentRepository {
    fun create(
        climberId: Int,
        boulderId: Int?,
        outdoorRouteId: Int?,
        freelogGymName: String?,
        freelogGrade: String?,
        date: LocalDate,
        attempts: Int,
        style: String?,
        notes: String?
    ): Int

    fun getByClimberId(climberId: Int): List<Ascent>
    fun getById(id: Int): Ascent?
    fun delete(id: Int, climberId: Int): Boolean
}