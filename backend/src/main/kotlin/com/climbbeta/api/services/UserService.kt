package com.climbbeta.api.services

import org.mindrot.jbcrypt.BCrypt
import com.climbbeta.api.domain.Token
import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.repository.TokenRepository
import com.climbbeta.api.repository.UserRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository,
    private val tokenRepository: TokenRepository
) {
    fun createUser(username: String, email: String, passwordRaw: String, role: UserRole): User {
        // 1. Verificar se o email ou username já existem
        if (userRepository.existsByEmail(email)) {
            throw IllegalArgumentException("Este email já está registado!")
        }
        if (userRepository.existsByUsername(username)) {
            throw IllegalArgumentException("Este username já está em uso!")
        }

        // Gerar o Hash da password (o gensalt() adiciona lixo aleatório para ser impossível de decifrar)
        val hashedPw = BCrypt.hashpw(passwordRaw, BCrypt.gensalt())

        // 2. Criar o objeto User (Num cenário real faríamos o Hash da password aqui)
        val newUser = User(
            username = username,
            email = email,
            passwordHash = hashedPw, // Para já guardamos a raw, depois pomos o BCrypt!
            role = role
        )

        // 3. Mandar o repositório gravar na Base de Dados e devolver o utilizador criado
        return userRepository.createUser(newUser)
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