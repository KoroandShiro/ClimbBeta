package com.climbbeta.api.services

import com.climbbeta.api.domain.Gym
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.repository.GymRepository
import com.climbbeta.api.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class GymService(
    private val gymRepository: GymRepository,
    private val userRepository: UserRepository
) {

    fun createGym(
        authenticatedUser: User,
        ownerId: Int,
        name: String,
        address: String,
        city: String,
        coverImageUrl: String?
    ): Gym {
        validateGymData(ownerId, name, address, city)

        if (authenticatedUser.role != UserRole.ADMIN && authenticatedUser.role != UserRole.GYM_OWNER) {
            throw SecurityException("Apenas ADMIN ou GYM_OWNER podem criar ginásios.")
        }

        if (authenticatedUser.role == UserRole.GYM_OWNER && authenticatedUser.id != ownerId) {
            throw SecurityException("GYM_OWNER só pode criar ginásios com o próprio ownerId.")
        }

        if (!gymRepository.existsGymOwnerProfile(ownerId)) {
            throw IllegalArgumentException("ownerId inválido: não existe perfil de gym owner.")
        }

        val ownerUser = userRepository.getUserById(ownerId)
            ?: throw IllegalArgumentException("ownerId inválido: utilizador não encontrado.")

        if (ownerUser.role != UserRole.GYM_OWNER) {
            throw IllegalArgumentException("ownerId inválido: o utilizador não tem role GYM_OWNER.")
        }

        val gym = Gym(
            id = 0,
            ownerId = ownerId,
            name = name.trim(),
            address = address.trim(),
            city = city.trim(),
            coverImageUrl = coverImageUrl?.trim()?.ifBlank { null }
        )

        return gymRepository.createGym(gym)
    }

    fun getGyms(): List<Gym> = gymRepository.getGyms()

    fun getGymById(id: Int): Gym {
        if (id <= 0) throw IllegalArgumentException("ID inválido.")

        return gymRepository.getGymById(id)
            ?: throw NoSuchElementException("Ginásio não encontrado.")
    }

    fun updateGym(
        authenticatedUser: User,
        id: Int,
        name: String,
        address: String,
        city: String,
        coverImageUrl: String?
    ) {
        if (id <= 0) throw IllegalArgumentException("ID inválido.")

        val existingGym = gymRepository.getGymById(id)
            ?: throw NoSuchElementException("Ginásio não encontrado.")

        if (authenticatedUser.role != UserRole.ADMIN && authenticatedUser.role != UserRole.GYM_OWNER) {
            throw SecurityException("Apenas ADMIN ou GYM_OWNER podem atualizar ginásios.")
        }

        if (authenticatedUser.role == UserRole.GYM_OWNER && existingGym.ownerId != authenticatedUser.id) {
            throw SecurityException("GYM_OWNER só pode atualizar o próprio ginásio.")
        }

        validateGymData(existingGym.ownerId, name, address, city)

        val updatedGym = existingGym.copy(
            name = name.trim(),
            address = address.trim(),
            city = city.trim(),
            coverImageUrl = coverImageUrl?.trim()?.ifBlank { null }
        )

        val updated = gymRepository.updateGym(updatedGym)
        if (!updated) {
            throw NoSuchElementException("Ginásio não encontrado para atualização.")
        }
    }

    private fun validateGymData(ownerId: Int, name: String, address: String, city: String) {
        if (ownerId <= 0) throw IllegalArgumentException("ownerId inválido.")
        if (name.isBlank()) throw IllegalArgumentException("name é obrigatório.")
        if (address.isBlank()) throw IllegalArgumentException("address é obrigatório.")
        if (city.isBlank()) throw IllegalArgumentException("city é obrigatório.")
    }
}