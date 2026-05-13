package com.climbbeta.api.repository

import com.climbbeta.api.domain.ActivationCode

interface ActivationCodeRepository {
    fun createCode(code: String): ActivationCode
    fun getByCode(code: String): ActivationCode?
    fun markAsUsed(code: String, userId: Int)
    fun getAllCodes(): List<ActivationCode>
}
