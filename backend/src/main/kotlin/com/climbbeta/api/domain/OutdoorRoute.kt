package com.climbbeta.api.domain

data class OutdoorRoute(
    val id: Int,
    val creatorId: Int?, // Pode ser null se o user apagar a conta (ON DELETE SET NULL)
    val name: String?,
    val sector: String,
    val location: String,
    val grade: String
)