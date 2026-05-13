-- =========================================================================
-- CLIMBBETA - SCRIPT DE CRIAÇÃO DA BASE DE DADOS (POSTGRESQL)
-- =========================================================================

-- 1. Criação de Tipos Enumerados (Enums)
CREATE TYPE user_role AS ENUM ('ADMIN', 'CLIMBER', 'GYM_OWNER');
CREATE TYPE user_status AS ENUM ('PENDING', 'VERIFIED');
CREATE TYPE media_type AS ENUM ('IMAGE', 'VIDEO');

-- =========================================================================
-- AGREGADO 1: IDENTITY E PERFIS
-- =========================================================================

CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       role user_role NOT NULL,
                       status user_status NOT NULL DEFAULT 'PENDING',
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tokens (
                        token_hash VARCHAR(255) PRIMARY KEY,
                        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_used_at TIMESTAMP
);

CREATE TABLE climber_profiles (
                                  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                                  bio TEXT,
                                  height DECIMAL(5,2),
                                  weight DECIMAL(5,2),
                                  ape_index DECIMAL(5,2),
                                  avatar_url VARCHAR(500)
);

CREATE TABLE gym_owner_profiles (
                                    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                                    company_name VARCHAR(100) NOT NULL,
                                    contact_phone VARCHAR(20)
);

CREATE TABLE activation_codes (
                                  code       VARCHAR(36) PRIMARY KEY,
                                  is_used    BOOLEAN NOT NULL DEFAULT FALSE,
                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  used_by    INT REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================================
-- AGREGADO 2: GESTÃO DE GINÁSIOS (INDOOR)
-- =========================================================================

CREATE TABLE gyms (
                      id SERIAL PRIMARY KEY,
                      owner_id INT NOT NULL REFERENCES gym_owner_profiles(user_id) ON DELETE RESTRICT,
                      name VARCHAR(100) NOT NULL,
                      address VARCHAR(255) NOT NULL,
                      city VARCHAR(100) NOT NULL,
                      cover_image_url VARCHAR(500)
);

CREATE TABLE boulders (
                          id SERIAL PRIMARY KEY,
                          gym_id INT NOT NULL REFERENCES gyms(id) ON DELETE CASCADE, -- Ligação direta ao Ginásio!
                          color VARCHAR(50) NOT NULL,
                          hex_color VARCHAR(10),
                          grade VARCHAR(10) NOT NULL,
                          setter_name VARCHAR(100),
                          set_date DATE NOT NULL,
                          is_active BOOLEAN DEFAULT TRUE,
                          image_url VARCHAR(500)
);

-- =========================================================================
-- AGREGADO 3: ECOSSISTEMA OUTDOOR
-- =========================================================================

CREATE TABLE outdoor_routes (
                                id SERIAL PRIMARY KEY,
                                creator_id INT REFERENCES climber_profiles(user_id) ON DELETE SET NULL,
                                name VARCHAR(100),
                                sector VARCHAR(100) NOT NULL,
                                location VARCHAR(100) NOT NULL,
                                grade VARCHAR(10) NOT NULL
);

-- =========================================================================
-- AGREGADO 4: O LOGBOOK HÍBRIDO E MEDIA
-- =========================================================================

CREATE TABLE ascents (
                         id SERIAL PRIMARY KEY,
                         climber_id INT NOT NULL REFERENCES climber_profiles(user_id) ON DELETE CASCADE,

    -- Chaves Estrangeiras (Opcionais devido ao Free Log)
                         boulder_id INT REFERENCES boulders(id) ON DELETE SET NULL,
                         outdoor_route_id INT REFERENCES outdoor_routes(id) ON DELETE SET NULL,

    -- Campos de Free Logging
                         freelog_gym_name VARCHAR(100),
                         freelog_grade VARCHAR(10),

    -- Metadados da subida
                         date DATE NOT NULL DEFAULT CURRENT_DATE,
                         attempts INT DEFAULT 1,
                         style VARCHAR(50),
                         notes TEXT,

    -- CONSTRAINT: Impede que um log seja Indoor e Outdoor ao mesmo tempo
                         CONSTRAINT check_hybrid_log CHECK (
                             (boulder_id IS NULL) OR (outdoor_route_id IS NULL)
                             )
);

CREATE TABLE media (
                       id SERIAL PRIMARY KEY,
                       uploader_id INT NOT NULL REFERENCES climber_profiles(user_id) ON DELETE CASCADE,
                       ascent_id INT REFERENCES ascents(id) ON DELETE CASCADE,
                       boulder_id INT REFERENCES boulders(id) ON DELETE CASCADE,
                       media_url VARCHAR(500) NOT NULL,
                       media_type media_type NOT NULL,

    -- CONSTRAINT: Garante que o ficheiro pertence a uma subida ou a um boulder
                       CONSTRAINT check_media_link CHECK (
                           (ascent_id IS NULL) OR (boulder_id IS NULL)
                           )
);

-- =========================================================================
-- AGREGADO 5: COMPONENTE SOCIAL E GAMIFICAÇÃO
-- =========================================================================

CREATE TABLE comments (
                          id SERIAL PRIMARY KEY,
                          ascent_id INT NOT NULL REFERENCES ascents(id) ON DELETE CASCADE,
                          author_id INT NOT NULL REFERENCES climber_profiles(user_id) ON DELETE CASCADE,
                          comment_text TEXT NOT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE follows_climber (
                                 follower_id INT NOT NULL REFERENCES climber_profiles(user_id) ON DELETE CASCADE,
                                 followed_id INT NOT NULL REFERENCES climber_profiles(user_id) ON DELETE CASCADE,
                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 PRIMARY KEY (follower_id, followed_id),
                                 CONSTRAINT no_self_follow CHECK (follower_id != followed_id)
    );

CREATE TABLE follows_gym (
                             climber_id INT NOT NULL REFERENCES climber_profiles(user_id) ON DELETE CASCADE,
                             gym_id INT NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             PRIMARY KEY (climber_id, gym_id)
);

CREATE TABLE saves_project (
                               climber_id INT NOT NULL REFERENCES climber_profiles(user_id) ON DELETE CASCADE,
                               boulder_id INT NOT NULL REFERENCES boulders(id) ON DELETE CASCADE,
                               saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               PRIMARY KEY (climber_id, boulder_id)
);

CREATE TABLE likes (
                       climber_id INT NOT NULL REFERENCES climber_profiles(user_id) ON DELETE CASCADE,
                       ascent_id INT NOT NULL REFERENCES ascents(id) ON DELETE CASCADE,
                       liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       PRIMARY KEY (climber_id, ascent_id)
);