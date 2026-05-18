package com.climbbeta.api.repository

import com.climbbeta.api.domain.Boulder

interface SaveRepository {
    fun save(climberId: Int, boulderId: Int): Boolean
    fun unsave(climberId: Int, boulderId: Int): Boolean
    fun isSaved(climberId: Int, boulderId: Int): Boolean
    fun getSavedBoulders(climberId: Int): List<Boulder>
}
