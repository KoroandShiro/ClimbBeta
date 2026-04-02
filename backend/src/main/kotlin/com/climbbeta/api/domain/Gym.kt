package com.climbbeta.api.domain

data class Gym(
    val id: Int,
    val ownerId: Int,
    val name: String,
    val address: String,
    val city: String,
    val coverImageUrl: String? = null
)