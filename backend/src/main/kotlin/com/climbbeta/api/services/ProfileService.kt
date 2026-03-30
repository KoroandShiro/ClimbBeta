package com.climbbeta.api.services

import com.climbbeta.api.domain.ClimberProfile
import com.climbbeta.api.repository.ProfileRepository
import org.springframework.stereotype.Service

@Service
class ProfileService(
    private val profileRepository: ProfileRepository
) {
    fun getClimberProfile(userId: Int): ClimberProfile {
        return profileRepository.getClimberProfile(userId)
            ?: throw IllegalArgumentException("Perfil não encontrado.")
    }

    fun updateClimberProfile(userId: Int, bio: String?, height: Int?, apeIndex: Double?) {
        val updatedProfile = ClimberProfile(
            userId = userId,
            bio = bio,
            height = height,
            apeIndex = apeIndex
        )
        profileRepository.updateClimberProfile(updatedProfile)
    }
}