package com.climbbeta.api.domain

import java.time.LocalDate

data class Ascent(
    val id: Int,
    val climberId: Int,
    val boulderId: Int?,
    val outdoorRouteId: Int?,
    val freelogGymName: String?,
    val freelogGrade: String?,
    val date: LocalDate,
    val attempts: Int,
    val style: String?,
    val notes: String?
)