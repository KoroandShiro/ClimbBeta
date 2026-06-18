package com.climbbeta.api.repository

import com.climbbeta.api.domain.ClimberProfile

interface ProfileRepository {
    fun getClimberProfile(userId: Int): ClimberProfile?
    fun updateClimberProfile(profile: ClimberProfile)
    fun updateAvatarUrl(userId: Int, avatarUrl: String?)
}