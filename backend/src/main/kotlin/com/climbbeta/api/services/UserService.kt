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
            throw IllegalArgumentException("Este email já está registado!")
        }
        if (userRepository.existsByUsername(username)) {
            throw IllegalArgumentException("Este username já está em uso!")
        }

        val hashedPw = BCrypt.hashpw(passwordRaw, BCrypt.gensalt())

        // GYM_OWNER começa PENDING até inserir um código de ativação do Admin
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
            throw SecurityException("Apenas GYM_OWNER pode verificar um código de ativação.")
        }
        if (authenticatedUser.status == UserStatus.VERIFIED) {
            throw IllegalStateException("A conta já está verificada.")
        }

        val activation = activationCodeRepository.getByCode(code)
            ?: throw NoSuchElementException("Código de ativação inválido.")

        if (activation.isUsed) {
            throw IllegalArgumentException("Este código já foi utilizado.")
        }

        activationCodeRepository.markAsUsed(code, authenticatedUser.id)
        userRepository.updateUserStatus(authenticatedUser.id, UserStatus.VERIFIED)

        return userRepository.getUserById(authenticatedUser.id)!!
    }

    fun login(email: String, passwordRaw: String): String {
        // 1. Procurar o user pelo email
        val user = userRepository.getUserByEmail(email)
            ?: throw IllegalArgumentException("Credenciais inválidas.")

        // 2. Verificar a password usando o BCrypt
        if (!BCrypt.checkpw(passwordRaw, user.passwordHash)) {
            throw IllegalArgumentException("Credenciais inválidas.")
        }

        // 3. Se chegou aqui, está autorizado! Vamos gerar um Token aleatório (UUID)
        val tokenString = UUID.randomUUID().toString()

        // 4. Guardar na Base de Dados
        val token = Token(
            tokenHash = tokenString,
            userId = user.id
        )
        tokenRepository.createToken(token)

        // 5. Devolver apenas a string ao utilizador
        return tokenString
    }
}