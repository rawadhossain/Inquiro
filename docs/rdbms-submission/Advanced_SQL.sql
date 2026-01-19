-- ============================================================
-- SQL Requirements Satisfaction Script
-- Project: Ask-Now Survey App (CSE 4508)
-- ============================================================

-- 1. DATABASE VIEWS
-- ------------------------------------------------------------

-- View 1: Survey Aggregate Performance
CREATE OR REPLACE VIEW vw_survey_performance AS
SELECT 
    s.id AS survey_id,
    s.title,
    u.name AS creator_name,
    COUNT(sr.id) AS total_responses,
    MAX(sr.createdAt) AS last_response_at
FROM survey s
JOIN "user" u ON s.creatorId = u.id
LEFT JOIN survey_response sr ON s.id = sr.surveyId
GROUP BY s.id, s.title, u.name;

-- View 2: Detailed Question Analytics
CREATE OR REPLACE VIEW vw_question_analytics AS
SELECT 
    q.id AS question_id,
    q.text AS question_text,
    q.type,
    s.title AS survey_title,
    COUNT(ra.id) AS answer_count
FROM question q
JOIN survey s ON q.surveyId = s.id
LEFT JOIN response_answer ra ON q.id = ra.questionId
GROUP BY q.id, q.text, q.type, s.title;


-- 2. INDEXING STRATEGIES
-- ------------------------------------------------------------

-- Index 1: Optimize survey lookups by status and date
CREATE INDEX idx_survey_status_dates ON survey (status, startDate, endDate);

-- Index 2: Full-text search index for survey titles
CREATE INDEX idx_survey_title_search ON survey USING gin(to_tsvector('english', title));

-- Index 3: Performance for response queries
CREATE INDEX idx_responses_composite ON survey_response (surveyId, createdAt DESC);


-- 3. PROCEDURAL SQL (PL/pgSQL)
-- ------------------------------------------------------------

-- Stored Procedure: Auto-close expired surveys
CREATE OR REPLACE PROCEDURE pr_close_expired_surveys()
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE survey
    SET status = 'CLOSED'
    WHERE status = 'PUBLISHED' 
      AND endDate IS NOT NULL 
      AND endDate < CURRENT_TIMESTAMP;
    COMMIT;
END;
$$;

-- Stored Function: Calculate completion rate for a survey
CREATE OR REPLACE FUNCTION fn_get_completion_rate(p_survey_id INT)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_questions INT;
    v_total_responses INT;
BEGIN
    SELECT COUNT(*) INTO v_total_questions FROM question WHERE surveyId = p_survey_id;
    SELECT COUNT(*) INTO v_total_responses FROM survey_response WHERE surveyId = p_survey_id;
    IF v_total_responses = 0 THEN RETURN 0; END IF;
    RETURN (SELECT COUNT(*) FROM response_answer ra 
            JOIN survey_response sr ON ra.responseId = sr.id 
            WHERE sr.surveyId = p_survey_id)::NUMERIC / (v_total_questions * v_total_responses);
END;
$$;

-- Trigger & Audit Table: Track status changes
CREATE TABLE IF NOT EXISTS system_audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT,
    record_id TEXT,
    old_value TEXT,
    new_value TEXT,
    changed_by TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION tr_fn_audit_survey_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO system_audit_log (table_name, record_id, old_value, new_value)
        VALUES ('survey', NEW.id::TEXT, OLD.status::TEXT, NEW.status::TEXT);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_audit_survey_status
AFTER UPDATE ON survey
FOR EACH ROW
EXECUTE FUNCTION tr_fn_audit_survey_status();


-- 4. ADVANCED DATABASE FEATURES
-- ------------------------------------------------------------

-- A. JSONB Usage
ALTER TABLE survey ADD COLUMN IF NOT EXISTS metadata JSONB;
SELECT title FROM survey WHERE metadata->>'theme' = 'dark';

-- B. Table Partitioning
CREATE TABLE response_answer_partitioned (
    id SERIAL,
    textValue TEXT,
    createdAt TIMESTAMP,
    responseId INT,
    questionId INT
) PARTITION BY RANGE (createdAt);

CREATE TABLE response_answer_2024 PARTITION OF response_answer_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE response_answer_2025 PARTITION OF response_answer_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
