package com.climbbeta.api.services

import com.climbbeta.api.domain.Boulder
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.repository.BoulderRepository
import com.climbbeta.api.repository.GymRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class BoulderService(
    private val boulderRepository: BoulderRepository,
    private val gymRepository: GymRepository
) {

    fun createBoulder(
        user: User,
        gymId: Int,
        color: String,
        hexColor: String?,
        grade: String,
        setterName: String?,
        setDate: LocalDate,
        imageUrl: String?
    ): Boulder {
        val gym = gymRepository.getGymById(gymId)
            ?: throw IllegalArgumentException("Ginásio não encontrado.")

        // Validação de segurança: apenas ADMIN ou o dono DESSE gym
        if (user.role != UserRole.ADMIN && gym.ownerId != user.id) {
            throw SecurityException("Apenas o dono do ginásio pode adicionar vias aqui.")
        }

        val boulder = Boulder(
            gymId = gymId,
            color = color,
            hexColor = hexColor,
            grade = grade,
            setterName = setterName,
            setDate = setDate,
            imageUrl = imageUrl
        )
        return boulderRepository.createBoulder(boulder)
    }

    fun getActiveBoulders(gymId: Int): List<Boulder> {
        return boulderRepository.getBouldersByGymId(gymId)
    }

    fun updateBoulderStatus(user: User, boulderId: Int, isActive: Boolean) {
        val boulder = boulderRepository.getBoulderById(boulderId)
            ?: throw IllegalArgumentException("Via não encontrada.")

        val gym = gymRepository.getGymById(boulder.gymId)
            ?: throw IllegalArgumentException("Ginásio associado não encontrado.")

        if (user.role != UserRole.ADMIN && gym.ownerId != user.id) {
            throw SecurityException("Apenas o dono do ginásio pode desativar esta via.")
        }

        boulderRepository.updateBoulderStatus(boulderId, isActive)
    }
}