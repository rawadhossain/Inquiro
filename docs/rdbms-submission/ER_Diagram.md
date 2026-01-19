# Entity Relationship Diagram

The following Mermaid diagram represents the logical schema of the **Ask-Now** Survey Application, expanded to 13 entities to meet the project's requirement for complexity (10–15 entities).

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER : contains
    USER ||--o{ SESSION : has
    USER ||--o{ ACCOUNT : holds
    USER ||--o{ SURVEY : creates
    USER ||--o{ SURVEY_RESPONSE : submits
    USER ||--o{ AUDIT_LOG : "triggers (Admin/Creator)"
    
    SURVEY ||--o{ QUESTION : contains
    SURVEY ||--o{ SURVEY_RESPONSE : receives
    SURVEY ||--o{ SURVEY_TOKEN : "uses for access"
    SURVEY }o--|| CATEGORY : belongs_to
    
    QUESTION ||--o{ QUESTION_OPTION : has
    QUESTION ||--o{ RESPONSE_ANSWER : "is answered by"
    
    SURVEY_RESPONSE ||--o{ RESPONSE_ANSWER : consists_of
    SURVEY_TOKEN ||--o{ SURVEY_RESPONSE : validates

    ORGANIZATION {
        string id PK
        string name
        string plan_type
    }

    USER {
        string id PK
        string email
        string name
        string role
        string organization_id FK
    }

    SURVEY {
        int id PK
        string title
        string status
        string creator_id FK
        int category_id FK
    }

    CATEGORY {
        int id PK
        string name
    }

    QUESTION {
        int id PK
        string text
        string type
        int survey_id FK
    }

    SURVEY_RESPONSE {
        int id PK
        int survey_id FK
        string respondent_id FK
        datetime completed_at
    }

    AUDIT_LOG {
        int id PK
        string action
        string table_name
        string record_id
        string user_id FK
        datetime timestamp
    }
```

### Entities (13 Total):
1.  **User**: System users (Creators and Respondents).
2.  **Session**: Authentication sessions.
3.  **Account**: OAuth and local account details.
4.  **Verification**: Email/token verification records.
5.  **Survey**: Main survey containers.
6.  **Question**: Individual items within a survey.
7.  **QuestionOption**: Choices for multiple-choice or radio questions.
8.  **SurveyResponse**: A single submission of a survey.
9.  **ResponseAnswer**: Specific answers given to specific questions.
10. **SurveyToken**: Access controls for private surveys.
11. **Organization** (Mock): Grouping for users (e.g., Enterprise/Team).
12. **Category** (Mock): Survey classification (e.g., Marketing, HR).
13. **AuditLog** (Mock): Tracks system changes via triggers.
