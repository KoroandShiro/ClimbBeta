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

/**
 * Core Identity Management System coordinating credentials, registration state, and lifecycle tokens.
 *
 * Implements BCrypt password hashing logic, tracks multi-tier user registration state transitions,
 * and handles secure token exchanges for active client sessions.
 */
@Service
class UserService(
    private val userRepository: UserRepository,
    private val tokenRepository: TokenRepository,
    private val activationCodeRepository: ActivationCodeRepository
) {
    /**
     * Initializes and persists a new user record within the system database.
     *
     * Performs uniqueness scans on credentials and applies security sandboxing policies
     * (e.g., initializing commercial GYM_OWNER entities in a PENDING status).
     *
     * @throws IllegalArgumentException If either the unique email address or username is already taken.
     */
    fun createUser(username: String, email: String, passwordRaw: String, role: UserRole): User {
        if (userRepository.existsByEmail(email)) {
            throw IllegalArgumentException("This email is already registered!")
        }
        if (userRepository.existsByUsername(username)) {
            throw IllegalArgumentException("This username is already in use!")
        }

        val hashedPw = BCrypt.hashpw(passwordRaw, BCrypt.gensalt())
        val initialStatus = if (role == UserRole.GYM_OWNER) UserStatus.PENDING else UserStatus.VERIFIED

        val newUser = User(
            username = username, email = email, passwordHash = hashedPw,
            role = role, status = initialStatus
        )

        return userRepository.createUser(newUser)
    }

    /**
     * Validates a single-use administrative coupon to unlock a PENDING commercial account.
     *
     * Transition logic targets gym managers to unlock facility administration rights.
     *
     * @throws SecurityException If the account is not a gym owner.
     * @throws IllegalStateException If the user has already been verified.
     * @throws NoSuchElementException If the voucher key does not exist.
     * @throws IllegalArgumentException If the code was already redeemed.
     */
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

    /**
     * Verifies raw user credentials against encrypted records to initialize a session token.
     *
     * Generates a unique UUID hash on successful matches and records it into operational storage.
     *
     * @return Raw plaintext token string to be attached to the client Authorization header.
     * @throws IllegalArgumentException If credentials validation check fails.
     */
    fun login(email: String, passwordRaw: String): String {
        val user = userRepository.getUserByEmail(email)
            ?: throw IllegalArgumentException("Invalid credentials.")

        if (!BCrypt.checkpw(passwordRaw, user.passwordHash)) {
            throw IllegalArgumentException("Invalid credentials.")
        }

        val tokenString = UUID.randomUUID().toString()
        val token = Token(tokenHash = tokenString, userId = user.id)
        tokenRepository.createToken(token)

        return tokenString
    }

    fun searchUsers(query: String, currentUserId: Int) = userRepository.searchUsers(query, currentUserId)
}