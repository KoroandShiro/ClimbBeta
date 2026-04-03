package com.climbbeta.api.repository

import com.climbbeta.api.domain.Boulder

interface BoulderRepository {
    fun createBoulder(boulder: Boulder): Boulder
    fun getBouldersByGymId(gymId: Int): List<Boulder>
    fun getBoulderById(id: Int): Boulder?
    fun updateBoulderStatus(id: Int, isActive: Boolean): Boolean
}