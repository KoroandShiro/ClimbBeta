package com.climbbeta.api.services

import com.climbbeta.api.domain.Ascent
import com.climbbeta.api.repository.AscentRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import com.climbbeta.api.domain.FeedItem


@Service
class AscentService(private val ascentRepository: AscentRepository) {

    fun logAscent(
        climberId: Int, boulderId: Int?, outdoorRouteId: Int?,
        freelogGymName: String?, freelogGrade: String?,
        date: LocalDate?, attempts: Int, style: String?, notes: String?
    ): Int {
        // Validação de negócio: Não pode ser as duas coisas
        if (boulderId != null && outdoorRouteId != null) {
            throw IllegalArgumentException("Uma subida não pode ser Indoor e Outdoor ao mesmo tempo.")
        }

        return ascentRepository.create(
            climberId, boulderId, outdoorRouteId,
            freelogGymName, freelogGrade,
            date ?: LocalDate.now(),
            attempts, style, notes
        )
    }

    fun getClimberLogbook(climberId: Int) = ascentRepository.getByClimberId(climberId)

    fun getAscentById(id: Int): Ascent? = ascentRepository.getById(id)

    fun removeAscent(id: Int, climberId: Int) = ascentRepository.delete(id, climberId)

    fun getFeedForClimber(climberId: Int) = ascentRepository.getFeedForClimber(climberId)

}