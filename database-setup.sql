-- Script para verificar e criar as tabelas necessárias

-- Verificar se o banco existe
CREATE DATABASE IF NOT EXISTS saude_mental CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saude_mental;

-- Tabela de respostas dos usuários
CREATE TABLE IF NOT EXISTS respostas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    data_resposta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estresse1 INT NOT NULL,
    estresse2 INT NOT NULL,
    ansiedade1 INT NOT NULL,
    ansiedade2 INT NOT NULL,
    burnout1 INT NOT NULL,
    burnout2 INT NOT NULL,
    depressao1 INT NOT NULL,
    depressao2 INT NOT NULL,
    equilibrio INT NOT NULL,
    apoio INT NOT NULL,
    desabafo TEXT,
    INDEX idx_email (email),
    INDEX idx_data (data_resposta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de análises processadas pela IA
CREATE TABLE IF NOT EXISTS analises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resposta_id INT NOT NULL,
    estresse INT NOT NULL,
    ansiedade INT NOT NULL,
    burnout INT NOT NULL,
    depressao INT NOT NULL,
    equilibrio INT NOT NULL,
    apoio INT NOT NULL,
    alerta TEXT,
    dicas TEXT,
    justificativa_ia TEXT,
    data_analise TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resposta_id) REFERENCES respostas(id) ON DELETE CASCADE,
    INDEX idx_resposta (resposta_id),
    INDEX idx_data_analise (data_analise)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar se as tabelas foram criadas
SHOW TABLES;

-- Verificar estrutura das tabelas
DESCRIBE respostas;
DESCRIBE analises;

-- Verificar dados existentes
SELECT COUNT(*) as total_respostas FROM respostas;
SELECT COUNT(*) as total_analises FROM analises;