# RDBMS Project Report: Ask-Now Survey Application
**Course:** CSE 4508 - Relational Database Management Systems

## 1. System Description
**Ask-Now** is a modern, collaborative survey platform designed to facilitate real-time feedback collection and analytics. The system allows users to create surveys with diverse question types (Text, Multiple Choice, Rating, etc.), manage response access via secure tokens, and analyze results through an intuitive dashboard.

### Key Features:
- **RBAC**: Role-based access for Creators and Respondents.
- **Dynamic Surveys**: Support for 8+ question types.
- **Secure Sharing**: Periodic/Single-use tokens for private survey access.
- **Real-time Analytics**: Aggregated response data visualization.

## 2. Database Design & Complexity
The system utilizes a PostgreSQL backend with a schema designed for high relational integrity and scalability.

### Entity Count: 13 Entities
To meet the project criteria, the schema includes core entities (User, Survey, Question) as well as supportive entities for security (Token, Session) and administrative tracking (AuditLog, Organization).
*Details available in [ER_Diagram.md](file:///d:/Ask-Now/docs/rdbms-submission/ER_Diagram.md).*

### Normalization
The database is normalized to **Third Normal Form (3NF)**:
- **1NF**: All columns contain atomic values; each record is unique.
- **2NF**: No partial functional dependencies (all non-key attributes are fully dependent on the PK).
- **3NF**: No transitive dependencies. For example, `Account` details are linked to `User` via `userId` rather than duplicating user info.

## 3. SQL Requirements Implementation
The following advanced SQL features have been implemented to ensure performance and robust business logic:

| Requirement | Implementation Detail | File Reference |
| :--- | :--- | :--- |
| **Complex Queries (10+)** | Joins, Nested Subqueries, CTEs, ROLLUP | `Complex_Queries.sql` |
| **Views (2+)** | `vw_survey_performance`, `vw_question_analytics` | `Advanced_SQL.sql` |
| **Indexing (2+)** | B-Tree (Composite), GIN (Full-text) | `Advanced_SQL.sql` |
| **Stored Procedures** | `pr_close_expired_surveys` | `Advanced_SQL.sql` |
| **Triggers** | `tr_audit_survey_status` (After Update) | `Advanced_SQL.sql` |
| **Advanced Features** | JSONB metadata and Table Partitioning | `Advanced_SQL.sql` |

## 4. Query Optimization
Indexing was applied strategically to the most frequent query paths:
- **`idx_survey_status_dates`**: Optimizes the public survey gallery listing.
- **`idx_responses_composite`**: Drastically reduces load time for survey results pages by indexing the FK and Sort key together.

## 5. Conclusion
The **Ask-Now** project demonstrates a comprehensive application of RDBMS principles, combining a normalized relational structure with advanced procedural logic and analytical capabilities suitable for industrial-scale data collection.
