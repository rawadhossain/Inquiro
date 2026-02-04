-- ============================================================
-- Complex SQL Queries for Reporting & Analytics
-- Project: Ask-Now Survey App (CSE 4508)
-- ============================================================

-- Q1: Multi-Table Join
-- List all surveys with their creator details and total response counts
SELECT s.title, u.name as creator_name, COUNT(sr.id) as response_count
FROM survey s
JOIN "user" u ON s.creatorId = u.id
LEFT JOIN survey_response sr ON s.id = sr.surveyId
GROUP BY s.id, s.title, u.name
ORDER BY response_count DESC;

-- Q2: Nested Subquery
-- Find users who have not created any surveys using a NOT EXISTS clause
SELECT u.name, u.email
FROM "user" u
WHERE NOT EXISTS (
    SELECT 1 FROM survey s WHERE s.creatorId = u.id
);

-- Q3: Common Table Expression (CTE) & Subquery
-- Identify the "Best Performing Survey" per creator (most responses)
WITH SurveyResponses AS (
    SELECT creatorId, title, COUNT(sr.id) as rcount
    FROM survey s
    LEFT JOIN survey_response sr ON s.id = sr.surveyId
    GROUP BY creatorId, title
)
SELECT creatorId, title, rcount
FROM SurveyResponses sr1
WHERE rcount = (SELECT MAX(rcount) FROM SurveyResponses sr2 WHERE sr1.creatorId = sr2.creatorId);

-- Q4: ROLLUP (Analytical)
-- Response counts rolled up by Status and then total
SELECT status, COUNT(*) as count
FROM survey
GROUP BY ROLLUP(status);

-- Q5: Analytical Query - Average Response Time
-- Calculate the average time taken (in seconds) to complete each survey
SELECT s.title, AVG(EXTRACT(EPOCH FROM (sr.completedAt - sr.createdAt))) as avg_duration_seconds
FROM survey s
JOIN survey_response sr ON s.id = sr.surveyId
WHERE sr.completedAt IS NOT NULL
GROUP BY s.id, s.title;

-- Q6: GROUPING SETS
-- Summary of survey counts by status and isPublic visibility
SELECT status, isPublic, COUNT(*)
FROM survey
GROUP BY GROUPING SETS ((status), (isPublic), ());

-- Q7: Self Join
-- Finding surveys created by the same user within the same hour (potential spam/duplicates)
SELECT s1.title as survey_1, s2.title as survey_2, s1.creatorId
FROM survey s1
JOIN survey s2 ON s1.creatorId = s2.creatorId AND s1.id < s2.id
WHERE ABS(EXTRACT(EPOCH FROM (s1.createdAt - s2.createdAt))) < 3600;

-- Q8: Complex Aggregate for Question Distribution
-- Count how many of each answer type exists for a specific survey
SELECT q.type, COUNT(ra.id) as answer_volume
FROM question q
JOIN response_answer ra ON q.id = ra.questionId
WHERE q.surveyId = 1  -- Example Survey ID
GROUP BY q.type;

-- Q9: Top Respondents
-- List top 5 users who have responded to the most surveys
SELECT u.name, COUNT(sr.id) as participation_count
FROM "user" u
JOIN survey_response sr ON u.id = sr.respondentId
GROUP BY u.id, u.name
ORDER BY participation_count DESC
LIMIT 5;

-- Q10: Nested Subquery with IN
-- Find questions that belong to 'PUBLISHED' surveys
SELECT text FROM question 
WHERE surveyId IN (SELECT id FROM survey WHERE status = 'PUBLISHED');

-- Q11: Analytical Query - Engagement Score
-- Weighted engagement: (responses * 2) + (questions * 0.5)
SELECT 
    s.title,
    (COUNT(DISTINCT sr.id) * 2 + COUNT(DISTINCT q.id) * 0.5) as engagement_score
FROM survey s
LEFT JOIN survey_response sr ON s.id = sr.surveyId
LEFT JOIN question q ON s.id = q.surveyId
GROUP BY s.id, s.title
ORDER BY engagement_score DESC;
