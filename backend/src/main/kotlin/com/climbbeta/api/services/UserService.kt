package com.climbbeta.api.services

import com.climbbeta.api.domain.User
import com.climbbeta.api.domain.UserRole
import com.climbbeta.api.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository
) {
    fun createUser(username: String, email: String, passwordRaw: String, role: UserRole): User {
        // 1. Verificar se o email ou username já existem
        if (userRepository.existsByEmail(email)) {
            throw IllegalArgumentException("Este email já está registado!")
        }
        if (userRepository.existsByUsername(username)) {
            throw IllegalArgumentException("Este username já está em uso!")
        }

        // 2. Criar o objeto User (Num cenário real faríamos o Hash da password aqui)
        val newUser = User(
            username = username,
            email = email,
            passwordHash = passwordRaw, // Para já guardamos a raw, depois pomos o BCrypt!
            role = role
        )

        // 3. Mandar o repositório gravar na Base de Dados e devolver o utilizador criado
        return userRepository.createUser(newUser)
    }
}