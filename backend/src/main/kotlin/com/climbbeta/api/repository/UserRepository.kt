package com.climbbeta.api.repository

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserStatus
import com.climbbeta.api.repository_jdbi.JdbiUserRepository

interface UserRepository {
    fun existsByEmail(email: String): Boolean
    fun existsByUsername(username: String): Boolean
    fun createUser(user: User): User
    fun getUserByEmail(email: String): User?
    fun getUserById(id: Int): User?
    fun updateUserStatus(userId: Int, status: UserStatus)
    fun searchUsers(query: String, currentUserId: Int): List<JdbiUserRepository.UserSearchDbModel>
}