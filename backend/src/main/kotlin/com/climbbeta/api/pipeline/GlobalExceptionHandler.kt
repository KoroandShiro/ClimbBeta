package com.climbbeta.api.pipeline

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.servlet.resource.NoResourceFoundException

/**
 * Formato uniforme de erro da API.
 *
 * Em vez de devolver HTML genérico do Spring, todas as falhas saem com este corpo:
 * {"error": "<mensagem>"}. Por ser um tipo dedicado, o Swagger/OpenAPI consegue
 * documentar automaticamente o schema das respostas de erro.
 */
data class ErrorResponse(val error: String)

/**
 * Tradutor central de exceções -> respostas HTTP em JSON.
 *
 * Concentra num único sítio o mapeamento Exceção -> Status Code, eliminando os blocos
 * try/catch repetidos pelos controllers (Separação de Responsabilidades). O Spring escolhe
 * sempre o @ExceptionHandler MAIS específico para o tipo de exceção lançado, por isso o
 * handler genérico de Exception só atua como rede de segurança final.
 *
 * Nota: @RestControllerAdvice = @ControllerAdvice + @ResponseBody, ou seja, garante que o
 * objeto devolvido é serializado para JSON no corpo da resposta.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    /** Input inválido ou regra de negócio violada -> 400 Bad Request. */
    @ExceptionHandler(IllegalArgumentException::class)
    fun handleBadRequest(ex: IllegalArgumentException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(ex.message ?: "Invalid request."))

    /** Utilizador sem permissões para a operação -> 403 Forbidden. */
    @ExceptionHandler(SecurityException::class)
    fun handleForbidden(ex: SecurityException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ErrorResponse(ex.message ?: "Access denied."))

    /** Recurso pedido não existe -> 404 Not Found. */
    @ExceptionHandler(NoSuchElementException::class)
    fun handleNotFound(ex: NoSuchElementException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse(ex.message ?: "Resource not found."))

    /** Conflito de estado (ex.: conta já verificada) -> 409 Conflict. */
    @ExceptionHandler(IllegalStateException::class)
    fun handleConflict(ex: IllegalStateException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponse(ex.message ?: "Conflict with the current state."))

    /** Corpo do pedido com JSON malformado -> 400 Bad Request. */
    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleUnreadable(ex: HttpMessageNotReadableException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse("Malformed JSON request body."))

    /** Rota/recurso inexistente -> 404 (em vez de cair no handler genérico como 500). */
    @ExceptionHandler(NoResourceFoundException::class)
    fun handleNoResource(ex: NoResourceFoundException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse("Resource not found."))

    /**
     * Outras exceções do próprio Spring que já transportam um status HTTP. Preservamos esse status,
     * em vez de deixar o handler genérico abaixo mascará-lo como 500.
     */
    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatus(ex: ResponseStatusException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(ex.statusCode)
            .body(ErrorResponse(ex.reason ?: "Request failed."))

    /**
     * Rede de segurança final: qualquer exceção não prevista acima.
     * Devolve 500, mas SEMPRE em JSON (resolve o problema do HTML genérico).
     * Regista o stacktrace no log do servidor, mas NUNCA o expõe ao cliente.
     */
    @ExceptionHandler(Exception::class)
    fun handleGeneric(ex: Exception): ResponseEntity<ErrorResponse> {
        logger.error("Unhandled exception reached the global handler", ex)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse("An unexpected error occurred. Please try again later."))
    }
}
