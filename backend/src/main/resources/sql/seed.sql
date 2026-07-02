-- =========================================================================
-- CLIMBBETA - SEED DE DEMONSTRAÇÃO (POSTGRESQL)
-- =========================================================================
-- Corre DEPOIS de create-schema.sql. Repõe a base com um dataset rico e
-- coerente para a defesa (Feed e Leaderboards "a transbordar").
--
-- NOTAS:
--  * Faz RESET total (TRUNCATE ... RESTART IDENTITY) -> apaga os dados atuais.
--    Os IDs ficam previsíveis (users 1..30, gyms 1..5, etc.).
--  * Passwords: usa pgcrypto (crypt + bcrypt $2a$), compatível com o jBCrypt do backend.
--    >>> TODAS as contas têm a password: Demo1234! <<<
--  * Imagens: reutiliza objetos reais já no MinIO (192.168.1.64:9000) para o Feed
--    mostrar fotos verdadeiras; uma é do Pexels (sempre disponível).
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 0) RESET ----------------------------------------------------------------
-- CASCADE limpa dependências; RESTART IDENTITY repõe os contadores SERIAL a 1.
TRUNCATE TABLE
    likes, saves_project, follows_gym, follows_climber, comments, media,
    ascents, outdoor_routes, boulders, gyms,
    activation_codes, gym_owner_profiles, climber_profiles, tokens, users
    RESTART IDENTITY CASCADE;

-- =========================================================================
-- 1) UTILIZADORES (1 admin, 4 donos, 25 escaladores)
-- =========================================================================
-- O enum é convertido com ::user_role / ::user_status (padrão do projeto).
INSERT INTO users (username, email, password_hash, role, status) VALUES
  ('super_admin',     'admin@climbbeta.pt',   'x', 'ADMIN'::user_role,     'VERIFIED'::user_status),
  ('owner_vertigo',   'owner@vertigo.pt',     'x', 'GYM_OWNER'::user_role, 'VERIFIED'::user_status),
  ('owner_gravity',   'owner@gravity.pt',     'x', 'GYM_OWNER'::user_role, 'VERIFIED'::user_status),
  ('owner_climbup',   'owner@climbup.pt',     'x', 'GYM_OWNER'::user_role, 'VERIFIED'::user_status),
  ('owner_boulderhouse','owner@boulderhouse.pt','x','GYM_OWNER'::user_role,'VERIFIED'::user_status),
  ('koro',            'koro@gmail.com',       'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('mario_boulders',  'mario@gmail.com',      'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('ana_silva',       'ana@gmail.com',        'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('pedro_costa',     'pedro@gmail.com',      'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('rita_lopes',      'rita@gmail.com',       'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('joao_ferreira',   'joaof@gmail.com',      'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('sofia_martins',   'sofia@gmail.com',      'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('tiago_sousa',     'tiago@gmail.com',      'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('ines_rodrigues',  'ines@gmail.com',       'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('miguel_santos',   'miguel@gmail.com',     'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('carolina_pinto',  'carolina@gmail.com',   'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('diogo_almeida',   'diogo@gmail.com',      'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('beatriz_carvalho','beatriz@gmail.com',    'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('ruben_gomes',     'ruben@gmail.com',      'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('mariana_ribeiro', 'mariana@gmail.com',    'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('andre_marques',   'andre@gmail.com',      'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('catarina_dias',   'catarina@gmail.com',   'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('nuno_correia',    'nuno@gmail.com',       'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('helena_nunes',    'helena@gmail.com',     'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('fabio_moreira',   'fabio@gmail.com',      'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('patricia_cardoso','patricia@gmail.com',   'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('bruno_teixeira',  'bruno@gmail.com',      'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('daniela_fonseca', 'daniela@gmail.com',    'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('luis_cunha',      'luis@gmail.com',       'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status),
  ('vera_machado',    'vera@gmail.com',       'x', 'CLIMBER'::user_role,   'VERIFIED'::user_status);

-- Define a MESMA password (Demo1234!) para todas as contas. gen_salt() é volátil,
-- por isso cada utilizador recebe um hash distinto (com salt próprio), todos válidos.
UPDATE users SET password_hash = crypt('Demo1234!', gen_salt('bf', 10));

-- =========================================================================
-- 2) PERFIS (o backend cria-os no registo; aqui fazemos à mão)
-- =========================================================================
INSERT INTO gym_owner_profiles (user_id, company_name, contact_phone) VALUES
  (2, 'Vertigo Climbing Lda', '+351 211 111 111'),
  (3, '9.8 Gravity',          '+351 222 222 222'),
  (4, 'Climb Up Portugal',    '+351 233 333 333'),
  (5, 'Boulder House',        '+351 244 444 444');

-- Perfis de escalador (ids 6..30) gerados com variedade de bio/altura/ape index.
INSERT INTO climber_profiles (user_id, bio, height, weight, ape_index, avatar_url)
SELECT
    g,
    (ARRAY['Crimps over jugs.','Outdoor sempre que possível.','Weekend warrior.',
           'A projetar o meu primeiro V8.','Café e depois escalar.','Slab is life.',
           'Apaixonado por dynos.'])[1 + (g % 7)],
    165 + (g % 25),
    55 + (g % 30),
    -2 + (g % 8),
    NULL
FROM generate_series(6, 30) g;

-- Avatares reais (objetos que já existem no MinIO) para o koro e o mario.
UPDATE climber_profiles SET avatar_url =
  'http://192.168.1.64:9000/climbbeta-media/2-313a087f-7ccf-4001-a769-351e20af994f-4B298D98-3261-47FC-9B24-AF234B2C4F00.jpg'
  WHERE user_id = 6;
UPDATE climber_profiles SET avatar_url =
  'http://192.168.1.64:9000/climbbeta-media/4-14ef165f-2b80-40bf-9038-8c6ad1fef7fc-15359AF1-672E-4B28-8FB3-1B8714F15CDB.jpg'
  WHERE user_id = 7;

-- =========================================================================
-- 3) GINÁSIOS (5) — owner_id aponta para gym_owner_profiles
-- =========================================================================
INSERT INTO gyms (owner_id, name, address, city, cover_image_url) VALUES
  (2, 'Vertigo Marvila',   'Rua do Açúcar 76, Marvila', 'Lisboa',  'http://192.168.1.64:9000/climbbeta-media/a6de3138-0d71-477d-91b2-7ad543a81c7f.jpg'),
  (3, '9.8 Gravity Lisboa','Av. Infante D. Henrique 200','Lisboa', 'http://192.168.1.64:9000/climbbeta-media/abcb7b78-f015-4ca6-a64e-c216ce072238.jpg'),
  (4, 'Climb Up Cascais',  'Estrada da Malveira 12',     'Cascais', 'http://192.168.1.64:9000/climbbeta-media/94d01d15-ea71-4417-96c2-d4fae758034a.png'),
  (5, 'Boulder House Porto','Rua de Santa Catarina 500', 'Porto',   'http://192.168.1.64:9000/climbbeta-media/a6de3138-0d71-477d-91b2-7ad543a81c7f.jpg'),
  (2, 'Vertigo Almada',    'Rua Capitão Leitão 9',       'Almada',  'http://192.168.1.64:9000/climbbeta-media/abcb7b78-f015-4ca6-a64e-c216ce072238.jpg');

-- =========================================================================
-- 4) BOULDERS (30) — cores/graus variados, 2 inativos (demo do soft-delete)
-- =========================================================================
INSERT INTO boulders (gym_id, color, hex_color, grade, setter_name, set_date, is_active, image_url)
SELECT
    1 + (g % 5),
    (ARRAY['Amarelo','Azul','Verde','Vermelho','Preto','Branco','Roxo','Laranja','Rosa','Cinza'])[1 + (g % 10)],
    (ARRAY['#FFD600','#2962FF','#00C853','#D50000','#000000','#FAFAFA','#6A1B9A','#FF6D00','#EC407A','#9E9E9E'])[1 + (g % 10)],
    'V' || (g % 9),
    (ARRAY['João Setter','Mariana Route','Pedro Holds','Guest Setter'])[1 + (g % 4)],
    DATE '2026-06-15' - ((g * 3) % 90),
    (g NOT IN (7, 18)),                 -- boulders 8 e 19 ficam inativos
    (ARRAY[
        'http://192.168.1.64:9000/climbbeta-media/a6de3138-0d71-477d-91b2-7ad543a81c7f.jpg',
        'http://192.168.1.64:9000/climbbeta-media/2b20d5fb-d5dc-4f93-a64b-735cb6f92904.jpg',
        'http://192.168.1.64:9000/climbbeta-media/7b07ba53-11b8-42c5-8f26-bebfd9c51d7e.webp',
        'https://images.pexels.com/photos/7591303/pexels-photo-7591303.jpeg'
    ])[1 + (g % 4)]
FROM generate_series(0, 29) g;

-- =========================================================================
-- 5) VIAS OUTDOOR (8)
-- =========================================================================
INSERT INTO outdoor_routes (creator_id, name, sector, location, grade) VALUES
  (6,  'Aresta Mágica',    'Setor dos Ventos', 'Peninha, Sintra',     'V4'),
  (7,  'Fenda do Mar',     'Fenda',            'Serra da Arrábida',   'V6'),
  (8,  'Bloco do Guincho', 'Praia',            'Guincho, Cascais',    'V3'),
  (9,  'O Teto Grande',    'Setor Norte',      'Peninha, Sintra',     'V7'),
  (10, 'Travessia do Lince','Lince',           'Monsanto, Lisboa',    'V2'),
  (6,  'Laje Dourada',     'Sol',              'Serra da Arrábida',   'V5'),
  (11, 'Pilar Cinzento',   'Pilar',            'Cabo Espichel',       'V8'),
  (12, 'Boulder do Rio',   'Rio',              'Gerês',               'V1');

-- =========================================================================
-- 6) ASCENTS (subidas) — ~170, espalhadas pelos últimos meses
-- =========================================================================
-- 6a) "Showcase": curadas, recentes, com notas — dão vida ao topo do Feed.
INSERT INTO ascents (climber_id, boulder_id, outdoor_route_id, freelog_gym_name, freelog_grade, date, attempts, style, notes) VALUES
  (6,  1,   NULL, NULL,         NULL, DATE '2026-06-26', 2, 'Top',     'Finalmente! O crux do amarelo caiu.'),
  (6,  NULL,1,    NULL,         NULL, DATE '2026-06-24', 1, 'Flash',   'Rocha perfeita na Peninha ao pôr do sol.'),
  (6,  NULL,NULL, 'Boulder Lab','V5', DATE '2026-06-22', 4, 'Top',     'Ginásio novo, os V5 deles puxam muito.'),
  (7,  3,   NULL, NULL,         NULL, DATE '2026-06-25', 1, 'Onsight', 'À primeira, que dia!'),
  (8,  5,   NULL, NULL,         NULL, DATE '2026-06-25', 3, 'Top',     'Slab traiçoeiro até ao fim.'),
  (9,  NULL,2,    NULL,         NULL, DATE '2026-06-23', 5, 'Top',     'A Fenda do Mar respeita-se.'),
  (10, 8,   NULL, NULL,         NULL, DATE '2026-06-21', 1, 'Flash',   NULL),
  (11, NULL,NULL, 'Vertical City','V4',DATE '2026-06-20',1, 'Flash',   'Sessão rápida ao almoço.'),
  (12, 12,  NULL, NULL,         NULL, DATE '2026-06-19', 6, 'Top',     'Custou seis tentativas, mas finalmente caiu!'),
  (7,  NULL,4,    NULL,         NULL, DATE '2026-06-18', 3, 'Top',     'O Teto Grande é brutal.'),
  (8,  2,   NULL, NULL,         NULL, DATE '2026-06-27', 1, 'Flash',   'Bom aquecimento da manhã.'),
  (6,  6,   NULL, NULL,         NULL, DATE '2026-06-17', 1, 'Onsight', 'Boa leitura de movimentos.');

-- 6b) Leaderboard do boulder 1: os 25 escaladores (6..30) fizeram-no -> ranking cheio.
INSERT INTO ascents (climber_id, boulder_id, date, attempts, style)
SELECT g, 1,
       DATE '2026-06-15' - (g % 12),
       CASE WHEN (ARRAY['Flash','Onsight','Top'])[1 + (g % 3)] IN ('Flash', 'Onsight')
            THEN 1 ELSE 1 + (g % 4) END,
       (ARRAY['Flash','Onsight','Top'])[1 + (g % 3)]
FROM generate_series(6, 30) g;

-- 6c) Volume INDOOR (90) espalhado por escaladores/boulders/datas (últimos 120 dias).
INSERT INTO ascents (climber_id, boulder_id, date, attempts, style)
SELECT 6 + (g % 25),
       1 + (g % 30),
       DATE '2026-06-27' - (g % 120),
       CASE WHEN (ARRAY['Flash','Onsight','Top'])[1 + (g % 3)] IN ('Flash', 'Onsight')
            THEN 1 ELSE 1 + (g % 5) END,
       (ARRAY['Flash','Onsight','Top'])[1 + (g % 3)]
FROM generate_series(0, 89) g;

-- 6d) Volume OUTDOOR (24).
INSERT INTO ascents (climber_id, outdoor_route_id, date, attempts, style)
SELECT 6 + (g % 25),
       1 + (g % 8),
       DATE '2026-06-27' - ((g * 5) % 110),
       CASE WHEN (ARRAY['Flash','Onsight','Top'])[1 + (g % 3)] IN ('Flash', 'Onsight')
            THEN 1 ELSE 1 + (g % 4) END,
       (ARRAY['Flash','Onsight','Top'])[1 + (g % 3)]
FROM generate_series(0, 23) g;

-- 6e) Volume FREE LOG / ginásio não-parceiro (20).
INSERT INTO ascents (climber_id, freelog_gym_name, freelog_grade, date, attempts, style)
SELECT 6 + (g % 25),
       (ARRAY['Boulder Lab','Vertical City','Rock Republic','Gravity Zone','The Cave','Urban Climb'])[1 + (g % 6)],
       'V' || (1 + (g % 8)),
       DATE '2026-06-27' - ((g * 7) % 100),
       CASE WHEN (ARRAY['Flash','Onsight','Top'])[1 + (g % 3)] IN ('Flash', 'Onsight')
            THEN 1 ELSE 1 + (g % 5) END,
       (ARRAY['Flash','Onsight','Top'])[1 + (g % 3)]
FROM generate_series(0, 19) g;

-- =========================================================================
-- 7) MEDIA — fotos reais ligadas às ascents (todas as showcase + 1 em cada 3)
-- =========================================================================
-- O Feed lê COALESCE(media, imagem do boulder, capa do ginásio), por isso
-- mesmo as ascents sem media mostram uma imagem. Aqui damos foto própria às
-- subidas em destaque e a uma fração das restantes.
INSERT INTO media (uploader_id, ascent_id, media_url, media_type)
SELECT a.climber_id, a.id,
       (ARRAY[
           'http://192.168.1.64:9000/climbbeta-media/ef681977-04f3-4320-bae0-1568a4bf5a10.jpg',
           'http://192.168.1.64:9000/climbbeta-media/a6de3138-0d71-477d-91b2-7ad543a81c7f.jpg',
           'http://192.168.1.64:9000/climbbeta-media/2b20d5fb-d5dc-4f93-a64b-735cb6f92904.jpg',
           'https://images.pexels.com/photos/7591303/pexels-photo-7591303.jpeg'
       ])[1 + (a.id % 4)],
       'IMAGE'::media_type
FROM ascents a
WHERE a.id <= 12 OR a.id % 3 = 0;

-- =========================================================================
-- 8) GRAFO SOCIAL — seguir, likes, projetos guardados, comentários
-- =========================================================================
-- O koro (6) segue toda a gente -> o Feed dele fica a transbordar.
INSERT INTO follows_climber (follower_id, followed_id)
SELECT 6, g FROM generate_series(7, 30) g;

-- Toda a gente segue o koro (hub social).
INSERT INTO follows_climber (follower_id, followed_id)
SELECT g, 6 FROM generate_series(7, 30) g
ON CONFLICT DO NOTHING;

-- Grafo denso de seguidores cruzados (evita auto-follow e duplicados).
INSERT INTO follows_climber (follower_id, followed_id)
SELECT 6 + (g % 25), 6 + ((g + 7) % 25)
FROM generate_series(0, 120) g
WHERE 6 + (g % 25) <> 6 + ((g + 7) % 25)
ON CONFLICT DO NOTHING;

-- Likes espalhados.
INSERT INTO likes (climber_id, ascent_id)
SELECT 6 + (g % 25), 1 + (g % 100)
FROM generate_series(0, 250) g
ON CONFLICT DO NOTHING;

-- Projetos guardados.
INSERT INTO saves_project (climber_id, boulder_id)
SELECT 6 + (g % 25), 1 + (g % 30)
FROM generate_series(0, 100) g
ON CONFLICT DO NOTHING;

-- Escaladores seguem alguns ginásios.
INSERT INTO follows_gym (climber_id, gym_id)
SELECT 6 + (g % 25), 1 + (g % 5)
FROM generate_series(0, 60) g
ON CONFLICT DO NOTHING;

-- Comentários nas subidas em destaque.
INSERT INTO comments (ascent_id, author_id, comment_text) VALUES
  (1, 7,  'Brutal, parabéns!'),
  (1, 8,  'Esse amarelo é mesmo traiçoeiro.'),
  (2, 9,  'Que vista!'),
  (4, 6,  'Onsight? Monstro.'),
  (6, 10, 'A Arrábida é especial.'),
  (5, 6,  'Boa! Slabs são o pior.'),
  (9, 11, 'A próxima é tua.'),
  (3, 12, 'Qual é o ginásio?');

-- =========================================================================
-- 9) CÓDIGOS DE ATIVAÇÃO (para demonstrar o gatekeeper de gym owners)
-- =========================================================================
-- O admin pode entregar um destes a um GYM_OWNER novo (que se regista PENDING).
INSERT INTO activation_codes (code, is_used) VALUES
  ('11111111-1111-1111-1111-111111111111', FALSE),
  ('22222222-2222-2222-2222-222222222222', FALSE);

-- =========================================================================
-- 10) RESUMO
-- =========================================================================
SELECT 'users'   AS tabela, COUNT(*) FROM users
UNION ALL SELECT 'gyms',           COUNT(*) FROM gyms
UNION ALL SELECT 'boulders',       COUNT(*) FROM boulders
UNION ALL SELECT 'outdoor_routes', COUNT(*) FROM outdoor_routes
UNION ALL SELECT 'ascents',        COUNT(*) FROM ascents
UNION ALL SELECT 'media',          COUNT(*) FROM media
UNION ALL SELECT 'follows',        COUNT(*) FROM follows_climber
UNION ALL SELECT 'likes',          COUNT(*) FROM likes
UNION ALL SELECT 'saves',          COUNT(*) FROM saves_project
UNION ALL SELECT 'comments',       COUNT(*) FROM comments;
