package com.climbbeta.api.repository

/**
 * Persistence contract for climbing media (photos/videos) linked to an ascent or a boulder.
 *
 * The binary itself lives in MinIO (uploaded via /media/upload); this repository only stores
 * the resulting public URL string, honouring RULE 1 (no image binaries in PostgreSQL).
 */
interface MediaRepository {
    /**
     * Links an already-uploaded media URL to an ascent.
     *
     * @param mediaType One of the `media_type` enum values ('IMAGE' or 'VIDEO').
     * @return The generated primary key of the new media row.
     */
    fun create(uploaderId: Int, ascentId: Int, mediaUrl: String, mediaType: String): Int
}
