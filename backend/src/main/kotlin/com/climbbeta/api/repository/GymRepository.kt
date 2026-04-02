package com.climbbeta.api.repository

import com.climbbeta.api.domain.Gym

interface GymRepository {
    fun createGym(gym: Gym): Gym
    fun getGyms(): List<Gym>
    fun getGymById(id: Int): Gym?
    fun updateGym(gym: Gym): Boolean
    fun existsGymOwnerProfile(userId: Int): Boolean
}