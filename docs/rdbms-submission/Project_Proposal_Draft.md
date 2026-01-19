# Project Proposal: Ask-Now Survey Application
**Course:** CSE 4508 - Relational Database Management Systems
**Submission:** Project Proposal & Initial Design

---

## 1. Project Overview
**Ask-Now** is a collaborative, web-based survey management system designed to streamline the process of gathering and analyzing data. The application provides a robust platform for creators to design dynamic surveys and for respondents to provide feedback securely, either anonymously or through authenticated sessions.

## 2. Motivation Behind the Project
In many academic and corporate environments, data collection is often hindered by fragmented tools or lack of data integrity. The motivation behind **Ask-Now** is to build a unified system that demonstrates the power of a **Relational Database (RDBMS)** in maintaining complex relationships between users, questions, and multi-dimensional responses. 
- **Integrity**: Ensuring every response is tied to the correct survey version.
- **Security**: Managing access control through granular roles and unique tokens.
- **Analytics**: Moving from simple data storage to complex relational reporting.

## 3. Key Features
- **Dynamic Survey Builder**: Support for multiple question types (Text, MCQ, Rating, etc.).
- **RBAC (Role-Based Access Control)**: Distinct permissions for Survey Creators and Respondents.
- **Transactional Response Submission**: Atomic storage of multi-question responses.
- **Security Tokens**: Unique access tokens with expiration and usage limits for private surveys.
- **Real-time Reporting**: Analytical views to visualize response trends and engagement.

## 4. Tools, Technologies, and DBMS Choice
- **DBMS**: **PostgreSQL** (Chosen for its robust support for ACID transactions, advanced indexing, and JSONB capabilities).
- **Backend Framework**: Next.js (TypeScript) with Prisma ORM.
- **Authentication**: Better Auth.
- **Frontend**: React with Tailwind CSS.

## 5. Initial Schema Outline
The database will consist of the following core entities (demonstrating 3NF normalization):
- **User**: Stores profile and authentication roles.
- **Survey**: Metadata for the survey (title, status, date range).
- **Question**: Relationship mapping of questions to surveys.
- **QuestionOption**: Choices for selection-based questions.
- **SurveyResponse**: Header record for a single submission.
- **ResponseAnswer**: Individual answers linked to questions and responses.
- **SurveyToken**: Access identifiers for secure distribution.
*(Expanded to 13 entities in the detailed design for audit logs and organizational metadata).*

## 6. Expected Database Objects
### Major SQL Queries
- Multi-table joins for generating respondent profiles per survey.
- Analytical queries using `ROLLUP` for response distribution benchmarks.
- Subqueries/CTEs for identifying best-performing questions.

### Triggers & Procedures
- **Trigger**: `tr_audit_survey_status` to track every status transition for security audits.
- **Procedure**: `pr_close_expired_surveys` for automated data lifecycle management.
- **Function**: `fn_get_completion_rate` for real-time performance calculation.

### Indexing Strategies
- Composite B-Tree indexes on `(surveyId, createdAt)` for rapid results retrieval.
- GIN index for full-text search across survey titles and descriptions.
