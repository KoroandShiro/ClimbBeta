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
            ?: throw IllegalArgumentException("Gym not found.")

        // Security validation: only ADMIN or the owner of THIS gym
        if (user.role != UserRole.ADMIN && gym.ownerId != user.id) {
            throw SecurityException("Only the gym owner can add routes here.")
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
            ?: throw IllegalArgumentException("Route not found.")

        val gym = gymRepository.getGymById(boulder.gymId)
            ?: throw IllegalArgumentException("Associated gym not found.")

        if (user.role != UserRole.ADMIN && gym.ownerId != user.id) {
            throw SecurityException("Only the gym owner can deactivate this route.")
        }

        boulderRepository.updateBoulderStatus(boulderId, isActive)
    }

    fun getBoulderById(boulderId: Int): Boulder? {
        return boulderRepository.getBoulderById(boulderId)
    }
}