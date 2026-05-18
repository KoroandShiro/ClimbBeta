package com.climbbeta.api.repository

import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.domain.LeaderboardEntry

interface BoulderRepository {
    fun createBoulder(boulder: Boulder): Boulder
    fun getBouldersByGymId(gymId: Int): List<Boulder>
    fun getBoulderById(id: Int): Boulder?
    fun updateBoulderStatus(id: Int, isActive: Boolean): Boolean
    fun getLeaderboard(boulderId: Int): List<LeaderboardEntry>
}