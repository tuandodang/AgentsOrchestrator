# Agent Data Flow: Output → Input Chain

This document provides detailed examples of how the output from one agent becomes the input to the next agent in the workflow.

## Complete Example: User Management Feature

### Overview of Data Flow

```
Requirements (User Input)
    ↓
[arch-002] Technical Requirement Analysis Agent
    ↓ requirements_doc
[arch-001] Technical Documentation Agent
    ↓ architecture_doc
[be-001] Planning Agent
    ↓ technical_spec
[be-002] Design Note Agent
    ↓ api_spec
[be-003] Implementation Agent
    ↓ source_code
[be-005] Unit Test Agent
    ↓ test_code
[be-004] Code Review Agent
    ↓ review_report
[test-003] E2E Test Agent
```

---

## Step 1: Requirements Analysis

### Agent: `arch-002` (Technical Requirement Analysis Agent)

### Input (From User)
```json
{
  "businessRequirements": {
    "feature": "User Management System",
    "description": "Need a complete user management system with authentication, authorization, and user profiles",
    "businessGoals": [
      "Allow administrators to manage user accounts",
      "Secure user authentication",
      "Role-based access control",
      "User self-service profile management"
    ],
    "constraints": {
      "timeline": "4 weeks",
      "budget": "$50,000",
      "compliance": ["GDPR", "SOC2"],
      "performance": "Support 10,000 concurrent users"
    }
  },
  "stakeholders": [
    {"name": "John Smith", "role": "Product Owner"},
    {"name": "Sarah Johnson", "role": "Security Lead"},
    {"name": "Mike Chen", "role": "Engineering Manager"}
  ]
}
```

### Output: `requirements_doc`
```json
{
  "metadata": {
    "documentId": "REQ-001",
    "version": "1.0",
    "createdAt": "2025-01-15T10:00:00Z",
    "createdBy": "arch-002",
    "approvedBy": ["John Smith", "Mike Chen"],
    "status": "approved"
  },
  "functionalRequirements": [
    {
      "id": "FR-001",
      "title": "User Registration",
      "description": "System shall allow new users to register with email and password",
      "priority": "Must Have",
      "acceptanceCriteria": [
        "User can provide email, password, first name, last name",
        "System validates email format",
        "System enforces password complexity (min 8 chars, uppercase, lowercase, number, special char)",
        "System rejects duplicate emails",
        "System sends verification email",
        "User receives confirmation of registration"
      ],
      "testability": "Can be tested via API and UI",
      "dependencies": []
    },
    {
      "id": "FR-002",
      "title": "User Authentication",
      "description": "System shall authenticate users with email and password",
      "priority": "Must Have",
      "acceptanceCriteria": [
        "User can login with valid credentials",
        "System returns JWT token on successful login",
        "System rejects invalid credentials",
        "System locks account after 5 failed attempts",
        "System provides password reset functionality"
      ],
      "dependencies": ["FR-001"]
    },
    {
      "id": "FR-003",
      "title": "User CRUD Operations",
      "description": "Administrators shall be able to create, read, update, and delete users",
      "priority": "Must Have",
      "acceptanceCriteria": [
        "Admin can create new users",
        "Admin can view list of users with pagination",
        "Admin can search and filter users",
        "Admin can update user details",
        "Admin can deactivate users (soft delete)",
        "All operations are logged for audit"
      ],
      "dependencies": ["FR-002"]
    },
    {
      "id": "FR-004",
      "title": "Role-Based Access Control",
      "description": "System shall implement role-based access control",
      "priority": "Must Have",
      "acceptanceCriteria": [
        "System supports roles: admin, user, moderator",
        "Admin can assign roles to users",
        "System enforces role permissions on all endpoints",
        "Users can only access allowed resources"
      ],
      "dependencies": ["FR-003"]
    }
  ],
  "nonFunctionalRequirements": [
    {
      "id": "NFR-001",
      "category": "Performance",
      "requirement": "API response time shall be less than 200ms at 95th percentile",
      "metric": "p95 response time",
      "target": "< 200ms",
      "measurement": "Performance testing with 10,000 concurrent users"
    },
    {
      "id": "NFR-002",
      "category": "Security",
      "requirement": "System shall comply with OWASP Top 10 security standards",
      "metric": "Zero critical vulnerabilities",
      "target": "Pass security scan",
      "measurement": "Automated security scanning"
    },
    {
      "id": "NFR-003",
      "category": "Scalability",
      "requirement": "System shall support 10,000 concurrent users",
      "metric": "Concurrent users",
      "target": "10,000",
      "measurement": "Load testing"
    },
    {
      "id": "NFR-004",
      "category": "Availability",
      "requirement": "System shall have 99.9% uptime",
      "metric": "Uptime percentage",
      "target": "99.9%",
      "measurement": "Monitoring and alerting"
    }
  ],
  "workBreakdownStructure": {
    "epic": "User Management System",
    "totalStoryPoints": 34,
    "estimatedDuration": "4 weeks",
    "stories": [
      {
        "id": "US-001",
        "title": "User Registration",
        "storyPoints": 8,
        "tasks": [
          {"id": "TASK-001", "title": "Create User entity and database schema", "estimate": "4h"},
          {"id": "TASK-002", "title": "Implement registration API endpoint", "estimate": "6h"},
          {"id": "TASK-003", "title": "Add email validation", "estimate": "2h"},
          {"id": "TASK-004", "title": "Add password hashing", "estimate": "2h"},
          {"id": "TASK-005", "title": "Implement email verification", "estimate": "6h"},
          {"id": "TASK-006", "title": "Write unit tests", "estimate": "4h"}
        ]
      },
      {
        "id": "US-002",
        "title": "User Authentication",
        "storyPoints": 8,
        "tasks": [
          {"id": "TASK-007", "title": "Implement JWT token generation", "estimate": "4h"},
          {"id": "TASK-008", "title": "Create login endpoint", "estimate": "4h"},
          {"id": "TASK-009", "title": "Add authentication middleware", "estimate": "4h"},
          {"id": "TASK-010", "title": "Implement account lockout", "estimate": "4h"},
          {"id": "TASK-011", "title": "Add password reset flow", "estimate": "6h"},
          {"id": "TASK-012", "title": "Write unit tests", "estimate": "4h"}
        ]
      },
      {
        "id": "US-003",
        "title": "User CRUD Operations",
        "storyPoints": 13,
        "tasks": [
          {"id": "TASK-013", "title": "Implement GET /users endpoint", "estimate": "4h"},
          {"id": "TASK-014", "title": "Implement POST /users endpoint", "estimate": "4h"},
          {"id": "TASK-015", "title": "Implement PUT /users/:id endpoint", "estimate": "4h"},
          {"id": "TASK-016", "title": "Implement DELETE /users/:id endpoint", "estimate": "3h"},
          {"id": "TASK-017", "title": "Add pagination and filtering", "estimate": "6h"},
          {"id": "TASK-018", "title": "Implement soft delete", "estimate": "3h"},
          {"id": "TASK-019", "title": "Add audit logging", "estimate": "4h"},
          {"id": "TASK-020", "title": "Write unit tests", "estimate": "6h"}
        ]
      },
      {
        "id": "US-004",
        "title": "Role-Based Access Control",
        "storyPoints": 5,
        "tasks": [
          {"id": "TASK-021", "title": "Add role field to User entity", "estimate": "2h"},
          {"id": "TASK-022", "title": "Create roles guard", "estimate": "4h"},
          {"id": "TASK-023", "title": "Apply roles to endpoints", "estimate": "3h"},
          {"id": "TASK-024", "title": "Write unit tests", "estimate": "3h"}
        ]
      }
    ]
  },
  "traceabilityMatrix": [
    {
      "requirementId": "FR-001",
      "userStory": "US-001",
      "designElement": "User Registration API",
      "testCases": ["TC-001", "TC-002", "TC-003"],
      "status": "To Do"
    },
    {
      "requirementId": "FR-002",
      "userStory": "US-002",
      "designElement": "Authentication Service",
      "testCases": ["TC-004", "TC-005", "TC-006"],
      "status": "To Do"
    },
    {
      "requirementId": "FR-003",
      "userStory": "US-003",
      "designElement": "User CRUD API",
      "testCases": ["TC-007", "TC-008", "TC-009", "TC-010"],
      "status": "To Do"
    },
    {
      "requirementId": "FR-004",
      "userStory": "US-004",
      "designElement": "RBAC Middleware",
      "testCases": ["TC-011", "TC-012"],
      "status": "To Do"
    }
  ],
  "riskAnalysis": [
    {
      "id": "RISK-001",
      "description": "Password security complexity may impact user experience",
      "probability": "Medium",
      "impact": "Medium",
      "mitigation": "Provide clear password requirements and helpful error messages"
    },
    {
      "id": "RISK-002",
      "description": "Email delivery for verification may be unreliable",
      "probability": "Low",
      "impact": "High",
      "mitigation": "Implement retry mechanism and use reliable email service (SendGrid)"
    }
  ],
  "dependencies": {
    "external": [
      {"service": "SendGrid", "purpose": "Email delivery", "criticality": "High"},
      {"service": "PostgreSQL", "purpose": "Database", "criticality": "Critical"}
    ],
    "internal": []
  }
}
```

---

## Step 2: Architecture Design

### Agent: `arch-001` (Technical Documentation Agent)

### Input: Uses `requirements_doc` from Step 1

```json
{
  "requirements": {
    "source": "arch-002",
    "documentId": "REQ-001",
    "content": "<entire requirements_doc from above>"
  },
  "constraints": {
    "performance": "p95 < 200ms",
    "scalability": "10,000 concurrent users",
    "compliance": ["GDPR", "SOC2"],
    "availability": "99.9% uptime"
  }
}
```

### Output: `architecture_doc`

```json
{
  "metadata": {
    "documentId": "ARCH-001",
    "version": "1.0",
    "createdAt": "2025-01-15T11:00:00Z",
    "createdBy": "arch-001",
    "basedOn": ["REQ-001"],
    "status": "approved"
  },
  "executiveSummary": {
    "systemName": "User Management System",
    "description": "Scalable user management service with authentication, authorization, and user profile management",
    "technologyStack": {
      "backend": "Node.js 18.x, NestJS 10.x, TypeScript 5.x",
      "database": "PostgreSQL 15.x",
      "cache": "Redis 7.x",
      "messageQueue": "RabbitMQ 3.x (for async operations)",
      "authentication": "JWT (access + refresh tokens)"
    },
    "architecturalStyle": "Layered Architecture with Clean Architecture principles"
  },
  "architecturalDecisions": [
    {
      "id": "ADR-001",
      "title": "Use JWT for Authentication",
      "status": "Accepted",
      "context": "Need stateless authentication for scalability",
      "decision": "Implement JWT with short-lived access tokens (15min) and long-lived refresh tokens (7 days)",
      "consequences": {
        "positive": [
          "Stateless - easy to scale horizontally",
          "Standard protocol - good library support",
          "Can be validated without database lookup"
        ],
        "negative": [
          "Cannot revoke tokens before expiration",
          "Must implement refresh token mechanism"
        ]
      },
      "alternatives": [
        {"option": "Session-based auth", "reason": "Not chosen: doesn't scale well"},
        {"option": "OAuth2", "reason": "Not chosen: overkill for internal auth"}
      ]
    },
    {
      "id": "ADR-002",
      "title": "Use PostgreSQL for Primary Database",
      "status": "Accepted",
      "context": "Need ACID compliance for user data",
      "decision": "Use PostgreSQL with proper indexing and connection pooling",
      "consequences": {
        "positive": [
          "Strong ACID guarantees",
          "Excellent performance with proper indexes",
          "JSON support for flexible data",
          "Proven scalability"
        ],
        "negative": [
          "Vertical scaling limits",
          "Requires careful query optimization"
        ]
      }
    },
    {
      "id": "ADR-003",
      "title": "Implement Soft Deletes",
      "status": "Accepted",
      "context": "Need audit trail and ability to recover deleted users",
      "decision": "Use is_active flag for soft deletes instead of hard deletes",
      "consequences": {
        "positive": [
          "Audit trail maintained",
          "Can recover deleted data",
          "Compliance friendly"
        ],
        "negative": [
          "Database grows larger",
          "Must filter soft-deleted records in queries"
        ]
      }
    }
  ],
  "systemArchitecture": {
    "layers": [
      {
        "name": "API Layer",
        "responsibility": "HTTP request handling, routing, validation",
        "components": [
          "UsersController",
          "AuthController",
          "ValidationPipes",
          "Guards (Auth, Roles)"
        ],
        "technology": "NestJS Controllers, Guards, Pipes"
      },
      {
        "name": "Business Logic Layer",
        "responsibility": "Core business logic, orchestration",
        "components": [
          "UsersService",
          "AuthService",
          "EmailService",
          "EventHandlers"
        ],
        "technology": "NestJS Services, Event Emitters"
      },
      {
        "name": "Data Access Layer",
        "responsibility": "Database operations, caching",
        "components": [
          "UserRepository",
          "CacheService",
          "Database Migrations"
        ],
        "technology": "TypeORM, Redis"
      },
      {
        "name": "Integration Layer",
        "responsibility": "External service integration",
        "components": [
          "EmailServiceClient (SendGrid)",
          "LoggingService",
          "MonitoringService"
        ],
        "technology": "HTTP clients, SDKs"
      }
    ]
  },
  "componentArchitecture": {
    "userManagementService": {
      "responsibilities": [
        "User CRUD operations",
        "User profile management",
        "User search and filtering"
      ],
      "interfaces": {
        "rest": [
          "POST /api/v1/users",
          "GET /api/v1/users",
          "GET /api/v1/users/:id",
          "PUT /api/v1/users/:id",
          "DELETE /api/v1/users/:id"
        ]
      },
      "dependencies": [
        "AuthenticationService",
        "EmailService",
        "Database"
      ]
    },
    "authenticationService": {
      "responsibilities": [
        "User authentication",
        "Token generation and validation",
        "Password reset",
        "Account lockout"
      ],
      "interfaces": {
        "rest": [
          "POST /api/auth/login",
          "POST /api/auth/refresh",
          "POST /api/auth/logout",
          "POST /api/auth/forgot-password",
          "POST /api/auth/reset-password"
        ]
      },
      "dependencies": [
        "UserManagementService",
        "EmailService",
        "Cache"
      ]
    }
  },
  "databaseSchema": {
    "tables": [
      {
        "name": "users",
        "description": "Stores user account information",
        "columns": [
          {"name": "id", "type": "UUID", "constraints": "PRIMARY KEY"},
          {"name": "email", "type": "VARCHAR(255)", "constraints": "UNIQUE NOT NULL"},
          {"name": "password_hash", "type": "VARCHAR(255)", "constraints": "NOT NULL"},
          {"name": "first_name", "type": "VARCHAR(100)", "constraints": "NOT NULL"},
          {"name": "last_name", "type": "VARCHAR(100)", "constraints": "NOT NULL"},
          {"name": "role", "type": "VARCHAR(50)", "constraints": "NOT NULL DEFAULT 'user'"},
          {"name": "is_active", "type": "BOOLEAN", "constraints": "DEFAULT true"},
          {"name": "email_verified", "type": "BOOLEAN", "constraints": "DEFAULT false"},
          {"name": "failed_login_attempts", "type": "INTEGER", "constraints": "DEFAULT 0"},
          {"name": "locked_until", "type": "TIMESTAMP", "constraints": "NULL"},
          {"name": "created_at", "type": "TIMESTAMP", "constraints": "DEFAULT CURRENT_TIMESTAMP"},
          {"name": "updated_at", "type": "TIMESTAMP", "constraints": "DEFAULT CURRENT_TIMESTAMP"}
        ],
        "indexes": [
          {"name": "idx_users_email", "columns": ["email"]},
          {"name": "idx_users_role", "columns": ["role"]},
          {"name": "idx_users_created_at", "columns": ["created_at"]}
        ],
        "estimatedSize": "10,000 users → ~5MB"
      },
      {
        "name": "refresh_tokens",
        "description": "Stores refresh tokens for session management",
        "columns": [
          {"name": "id", "type": "UUID", "constraints": "PRIMARY KEY"},
          {"name": "user_id", "type": "UUID", "constraints": "FOREIGN KEY REFERENCES users(id)"},
          {"name": "token_hash", "type": "VARCHAR(255)", "constraints": "UNIQUE NOT NULL"},
          {"name": "expires_at", "type": "TIMESTAMP", "constraints": "NOT NULL"},
          {"name": "created_at", "type": "TIMESTAMP", "constraints": "DEFAULT CURRENT_TIMESTAMP"}
        ],
        "indexes": [
          {"name": "idx_refresh_tokens_user_id", "columns": ["user_id"]},
          {"name": "idx_refresh_tokens_expires_at", "columns": ["expires_at"]}
        ]
      }
    ]
  },
  "securityArchitecture": {
    "authentication": {
      "mechanism": "JWT-based authentication",
      "tokenTypes": {
        "accessToken": {
          "lifetime": "15 minutes",
          "storage": "Memory (not localStorage)",
          "algorithm": "HS256"
        },
        "refreshToken": {
          "lifetime": "7 days",
          "storage": "HTTP-only cookie",
          "rotation": "On each use"
        }
      }
    },
    "authorization": {
      "mechanism": "Role-Based Access Control (RBAC)",
      "roles": ["admin", "moderator", "user"],
      "implementation": "NestJS Guards with @Roles decorator"
    },
    "dataProtection": {
      "passwordHashing": "bcrypt with 10 rounds",
      "sensitiveData": "Encrypted at rest using PostgreSQL encryption",
      "piiHandling": "GDPR-compliant data handling and export"
    },
    "apiSecurity": {
      "rateLimiting": "100 requests/minute per IP",
      "cors": "Whitelist of allowed origins",
      "helmet": "Security headers via Helmet.js",
      "inputValidation": "class-validator on all DTOs"
    }
  },
  "performanceStrategy": {
    "caching": {
      "strategy": "Cache-aside pattern",
      "ttl": {
        "userData": "5 minutes",
        "userList": "1 minute"
      },
      "invalidation": "On user update/delete"
    },
    "databaseOptimization": {
      "indexing": "Indexes on email, role, created_at",
      "connectionPooling": "Min: 10, Max: 50 connections",
      "queryOptimization": "Use select specific fields, avoid N+1"
    },
    "scaling": {
      "horizontal": "Stateless design allows easy horizontal scaling",
      "loadBalancing": "NGINX or AWS ALB",
      "caching": "Redis cluster for distributed caching"
    }
  },
  "observability": {
    "logging": {
      "framework": "Winston",
      "levels": ["error", "warn", "info", "debug"],
      "structure": "Structured JSON logs",
      "sensitive data": "Passwords, tokens redacted from logs"
    },
    "monitoring": {
      "metrics": ["Request rate", "Response time", "Error rate", "Database connections"],
      "tools": "Prometheus + Grafana",
      "alerts": "Slack/PagerDuty integration"
    },
    "tracing": {
      "tool": "OpenTelemetry",
      "correlation": "Request ID in all logs"
    }
  },
  "deploymentArchitecture": {
    "environments": [
      {"name": "Development", "url": "http://localhost:3000"},
      {"name": "Staging", "url": "https://staging-api.example.com"},
      {"name": "Production", "url": "https://api.example.com"}
    ],
    "infrastructure": {
      "compute": "AWS ECS Fargate (2 vCPU, 4GB RAM per task)",
      "database": "AWS RDS PostgreSQL (Multi-AZ)",
      "cache": "AWS ElastiCache Redis (Cluster mode)",
      "loadBalancer": "AWS Application Load Balancer",
      "cdn": "CloudFront for static assets"
    },
    "cicd": {
      "pipeline": "GitHub Actions",
      "stages": ["Lint", "Test", "Build", "Security Scan", "Deploy"],
      "deploymentStrategy": "Blue-green deployment"
    }
  },
  "disasterRecovery": {
    "backupStrategy": {
      "database": "Automated daily backups with 30-day retention",
      "frequency": "Daily at 2 AM UTC",
      "testing": "Monthly restore tests"
    },
    "rto": "1 hour",
    "rpo": "15 minutes"
  }
}
```

---

## Step 3: Planning & API Design

### Agent: `be-001` (Planning Agent)

### Input: Uses `requirements_doc` and `architecture_doc`

```json
{
  "requirements": {
    "source": "arch-002",
    "documentId": "REQ-001",
    "functionalRequirements": "<FR list from Step 1>",
    "userStories": "<US list from Step 1>"
  },
  "architecture": {
    "source": "arch-001",
    "documentId": "ARCH-001",
    "technologyStack": "<tech stack from Step 2>",
    "componentArchitecture": "<component structure from Step 2>"
  },
  "teamCapacity": {
    "developers": 3,
    "sprintDuration": "2 weeks",
    "velocity": 20
  }
}
```

### Output: `technical_spec`

```json
{
  "metadata": {
    "documentId": "SPEC-001",
    "version": "1.0",
    "createdAt": "2025-01-15T11:30:00Z",
    "createdBy": "be-001",
    "basedOn": ["REQ-001", "ARCH-001"]
  },
  "sprintPlan": {
    "sprint1": {
      "goal": "User Registration and Authentication Core",
      "duration": "2 weeks",
      "stories": ["US-001", "US-002"],
      "storyPoints": 16,
      "tasks": [
        {
          "id": "TASK-001",
          "title": "Database schema and migrations",
          "estimate": "4h",
          "assignee": "Dev1",
          "dependencies": []
        },
        {
          "id": "TASK-002",
          "title": "User entity and repository",
          "estimate": "4h",
          "assignee": "Dev1",
          "dependencies": ["TASK-001"]
        },
        {
          "id": "TASK-003",
          "title": "Registration API endpoint",
          "estimate": "6h",
          "assignee": "Dev2",
          "dependencies": ["TASK-002"]
        },
        {
          "id": "TASK-004",
          "title": "Authentication service and JWT",
          "estimate": "8h",
          "assignee": "Dev3",
          "dependencies": ["TASK-002"]
        },
        {
          "id": "TASK-005",
          "title": "Email verification integration",
          "estimate": "6h",
          "assignee": "Dev2",
          "dependencies": ["TASK-003"]
        },
        {
          "id": "TASK-006",
          "title": "Unit tests for registration",
          "estimate": "4h",
          "assignee": "Dev2",
          "dependencies": ["TASK-003"]
        },
        {
          "id": "TASK-007",
          "title": "Unit tests for authentication",
          "estimate": "4h",
          "assignee": "Dev3",
          "dependencies": ["TASK-004"]
        }
      ]
    },
    "sprint2": {
      "goal": "User CRUD and RBAC",
      "duration": "2 weeks",
      "stories": ["US-003", "US-004"],
      "storyPoints": 18,
      "tasks": ["<similar structure>"]
    }
  },
  "technicalSpecification": {
    "overview": "RESTful API for user management with JWT authentication",
    "baseUrl": "/api/v1",
    "authentication": "Bearer token in Authorization header",
    "apiEndpoints": [
      {
        "path": "/users",
        "method": "POST",
        "description": "Create a new user",
        "authentication": "Required (admin role)",
        "requestBody": {
          "email": "string (required, valid email)",
          "password": "string (required, min 8 chars)",
          "firstName": "string (required)",
          "lastName": "string (required)",
          "role": "string (optional, enum: admin|user|moderator)"
        },
        "responses": {
          "201": "User created successfully",
          "400": "Invalid input",
          "401": "Unauthorized",
          "409": "Email already exists"
        },
        "implementationNotes": [
          "Hash password with bcrypt (10 rounds)",
          "Validate email uniqueness",
          "Send welcome email",
          "Return user without password"
        ]
      }
    ]
  },
  "acceptanceCriteria": {
    "US-001": [
      "User can register with valid email and password",
      "System validates email format",
      "System enforces password complexity",
      "System rejects duplicate emails",
      "System sends verification email",
      "Registration returns 201 with user data"
    ]
  },
  "dependencies": [
    {
      "dependency": "SendGrid API Key",
      "type": "External",
      "criticality": "High",
      "requiredBy": "Sprint 1 Week 1",
      "owner": "DevOps Team"
    },
    {
      "dependency": "PostgreSQL Database",
      "type": "Infrastructure",
      "criticality": "Critical",
      "requiredBy": "Sprint 1 Day 1",
      "owner": "DevOps Team"
    }
  ],
  "risks": [
    {
      "id": "RISK-001",
      "description": "Email delivery delays may affect user experience",
      "probability": "Medium",
      "impact": "Medium",
      "mitigation": "Implement async email sending with retry queue",
      "contingency": "Provide manual verification option"
    }
  ]
}
```

---

### Agent: `be-002` (Design Note Agent)

### Input: Uses `technical_spec` from Planning Agent

```json
{
  "technicalSpecification": {
    "source": "be-001",
    "documentId": "SPEC-001",
    "content": "<entire technical_spec from above>"
  },
  "architecture": {
    "source": "arch-001",
    "databaseSchema": "<schema from ARCH-001>"
  }
}
```

### Output: `api_spec`

```yaml
# OpenAPI Specification (excerpt - full spec is very long)
openapi: 3.0.3
info:
  title: User Management API
  description: RESTful API for user management with authentication and authorization
  version: 1.0.0
  contact:
    name: API Support
    email: api-support@example.com

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging
  - url: http://localhost:3000/v1
    description: Development

tags:
  - name: Users
    description: User management operations
  - name: Authentication
    description: Authentication and authorization

paths:
  /users:
    post:
      tags: [Users]
      summary: Create new user
      operationId: createUser
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
            example:
              email: "user@example.com"
              password: "SecurePass123!"
              firstName: "John"
              lastName: "Doe"
              role: "user"
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreateUserResponse'
              example:
                success: true
                data:
                  id: "550e8400-e29b-41d4-a716-446655440000"
                  email: "user@example.com"
                  firstName: "John"
                  lastName: "Doe"
                  role: "user"
                  isActive: true
                  emailVerified: false
                  createdAt: "2025-01-15T12:00:00Z"
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '409':
          $ref: '#/components/responses/Conflict'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    CreateUserRequest:
      type: object
      required:
        - email
        - password
        - firstName
        - lastName
      properties:
        email:
          type: string
          format: email
          example: "user@example.com"
        password:
          type: string
          format: password
          minLength: 8
          pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]
          example: "SecurePass123!"
        firstName:
          type: string
          minLength: 1
          maxLength: 100
          example: "John"
        lastName:
          type: string
          minLength: 1
          maxLength: 100
          example: "Doe"
        role:
          type: string
          enum: [admin, user, moderator]
          default: user

    UserResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        firstName:
          type: string
        lastName:
          type: string
        role:
          type: string
          enum: [admin, user, moderator]
        isActive:
          type: boolean
        emailVerified:
          type: boolean
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreateUserResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data:
          $ref: '#/components/schemas/UserResponse'
```

This OpenAPI spec is then passed to the Implementation Agent in Step 4 (shown in the other file).

---

Let me continue with the remaining steps in a separate file to complete the full chain.
