package com.climbbeta.api.repository

import com.climbbeta.api.domain.User

interface UserRepository {
    fun existsByEmail(email: String): Boolean
    fun existsByUsername(username: String): Boolean
    fun createUser(user: User): User
    fun getUserByEmail(email: String): User?
    fun getUserById(id: Int): User?
}