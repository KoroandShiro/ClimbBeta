package com.climbbeta.api.services

import com.climbbeta.api.domain.ClimberProfile
import com.climbbeta.api.repository.ProfileRepository
import org.springframework.stereotype.Service
import com.climbbeta.api.domain.ClimberProfileWithUserDTO
import com.climbbeta.api.domain.User


@Service
class ProfileService(
    private val profileRepository: ProfileRepository
) {
    fun getClimberProfile(userId: Int): ClimberProfile {
        return profileRepository.getClimberProfile(userId)
            ?: throw IllegalArgumentException("Perfil não encontrado.")
    }

    fun getClimberProfileWithUser(userId: Int, user: User): ClimberProfileWithUserDTO {
        val profile = getClimberProfile(userId)
        return ClimberProfileWithUserDTO(
            userId = profile.userId,
            username = user.username,
            email = user.email,
            bio = profile.bio,
            height = profile.height,
            apeIndex = profile.apeIndex,
            avatarUrl = null // Por agora null, depois podes adicionar logic para avatar
        )
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