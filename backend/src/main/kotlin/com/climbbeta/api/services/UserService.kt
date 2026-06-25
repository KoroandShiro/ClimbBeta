package com.climbbeta.api.services

import org.mindrot.jbcrypt.BCrypt
import com.climbbeta.api.domain.Token
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.domain.UserStatus
import com.climbbeta.api.repository.ActivationCodeRepository
import com.climbbeta.api.repository.TokenRepository
import com.climbbeta.api.repository.UserRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository,
    private val tokenRepository: TokenRepository,
    private val activationCodeRepository: ActivationCodeRepository
) {
    fun createUser(username: String, email: String, passwordRaw: String, role: UserRole): User {
        if (userRepository.existsByEmail(email)) {
            throw IllegalArgumentException("This email is already registered!")
        }
        if (userRepository.existsByUsername(username)) {
            throw IllegalArgumentException("This username is already in use!")
        }

        val hashedPw = BCrypt.hashpw(passwordRaw, BCrypt.gensalt())

        // GYM_OWNER starts as PENDING until an Admin activation code is provided
        val initialStatus = if (role == UserRole.GYM_OWNER) UserStatus.PENDING else UserStatus.VERIFIED

        val newUser = User(
            username = username,
            email = email,
            passwordHash = hashedPw,
            role = role,
            status = initialStatus
        )

        return userRepository.createUser(newUser)
    }

    fun verifyActivationCode(authenticatedUser: User, code: String): User {
        if (authenticatedUser.role != UserRole.GYM_OWNER) {
            throw SecurityException("Only GYM_OWNER can verify an activation code.")
        }
        if (authenticatedUser.status == UserStatus.VERIFIED) {
            throw IllegalStateException("Account is already verified.")
        }

        val activation = activationCodeRepository.getByCode(code)
            ?: throw NoSuchElementException("Invalid activation code.")

        if (activation.isUsed) {
            throw IllegalArgumentException("This code has already been used.")
        }

        activationCodeRepository.markAsUsed(code, authenticatedUser.id)
        userRepository.updateUserStatus(authenticatedUser.id, UserStatus.VERIFIED)

        return userRepository.getUserById(authenticatedUser.id)!!
    }

    fun login(email: String, passwordRaw: String): String {
        // 1. Search user by email
        val user = userRepository.getUserByEmail(email)
            ?: throw IllegalArgumentException("Invalid credentials.")

        // 2. Verify password with BCrypt
        if (!BCrypt.checkpw(passwordRaw, user.passwordHash)) {
            throw IllegalArgumentException("Invalid credentials.")
        }

        // 3. Authorized! Generate a random Token (UUID string representation)
        val tokenString = UUID.randomUUID().toString()

        // 4. Save token to the database
        val token = Token(
            tokenHash = tokenString,
            userId = user.id
        )
        tokenRepository.createToken(token)

        // 5. Return only the raw token string to the client
        return tokenString
    }

    fun searchUsers(query: String, currentUserId: Int) =
        userRepository.searchUsers(query, currentUserId)
}