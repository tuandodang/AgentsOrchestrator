# Complete Workflow Example: Data Flow Step-by-Step

This example demonstrates the complete data flow from Agent 1 through Agent 7, showing exactly how outputs become inputs.

## Scenario: Implementing User Password Reset Feature

### Initial User Input
```json
{
  "feature": "User Password Reset",
  "description": "Users should be able to reset their password via email verification",
  "requirements": [
    "User can request password reset",
    "System sends email with reset link",
    "Reset link expires after 1 hour",
    "User sets new password",
    "Old password cannot be reused"
  ]
}
```

---

## Step 1: Technical Requirement Analysis Agent (arch-002)

### Input (From User)
```json
{
  "businessRequirements": {
    "feature": "User Password Reset",
    "description": "Users should be able to reset their password via email verification"
  }
}
```

### Agent Processes
1. Analyzes requirements
2. Creates user stories
3. Defines acceptance criteria
4. Identifies dependencies
5. Creates WBS

### Output: `requirements_doc`
```json
{
  "documentId": "REQ-PWD-RESET-001",
  "functionalRequirements": [
    {
      "id": "FR-PWD-001",
      "title": "Request Password Reset",
      "description": "User can request password reset via email",
      "acceptanceCriteria": [
        "User provides email address",
        "System validates email exists",
        "System generates secure reset token",
        "System sends email with reset link",
        "Link valid for 1 hour"
      ]
    },
    {
      "id": "FR-PWD-002",
      "title": "Reset Password",
      "description": "User can set new password using reset token",
      "acceptanceCriteria": [
        "User clicks reset link from email",
        "System validates token not expired",
        "User provides new password",
        "New password meets complexity requirements",
        "Old password cannot be reused",
        "User receives confirmation"
      ]
    }
  ],
  "userStories": [
    {
      "id": "US-PWD-001",
      "story": "As a user, I want to request a password reset so that I can regain access to my account",
      "storyPoints": 5
    }
  ],
  "workBreakdownStructure": {
    "tasks": [
      {"id": "TASK-001", "title": "Create password_reset_tokens table"},
      {"id": "TASK-002", "title": "Implement POST /api/auth/forgot-password endpoint"},
      {"id": "TASK-003", "title": "Implement POST /api/auth/reset-password endpoint"},
      {"id": "TASK-004", "title": "Integrate email service for reset links"},
      {"id": "TASK-005", "title": "Add password history table"},
      {"id": "TASK-006", "title": "Implement password history validation"}
    ]
  }
}
```

**Key Outputs That Become Inputs:**
- `functionalRequirements` → Used by Planning Agent (be-001)
- `userStories` → Used by Planning Agent (be-001)
- `workBreakdownStructure` → Used by Planning Agent (be-001)

---

## Step 2: Planning Agent (be-001)

### Input (From arch-002)
```typescript
// The orchestrator passes the requirements_doc output from Step 1
{
  "requirements": {
    "source": "arch-002",
    "documentId": "REQ-PWD-RESET-001",
    "functionalRequirements": [/* from Step 1 */],
    "userStories": [/* from Step 1 */],
    "workBreakdownStructure": {/* from Step 1 */}
  }
}
```

### Agent Processes
1. Analyzes requirements
2. Creates technical specification
3. Breaks down into sprint tasks
4. Estimates effort
5. Identifies technical risks

### Output: `technical_spec`
```json
{
  "documentId": "SPEC-PWD-RESET-001",
  "basedOn": ["REQ-PWD-RESET-001"],
  "technicalApproach": {
    "tokenGeneration": "Crypto-secure random token (32 bytes)",
    "tokenStorage": "Hashed in database with expiration timestamp",
    "emailDelivery": "Async queue via SendGrid",
    "securityMeasures": [
      "Rate limit password reset requests",
      "Invalidate token after use",
      "Store password history (last 5 passwords)",
      "Token expires after 1 hour"
    ]
  },
  "apiEndpoints": [
    {
      "path": "/api/auth/forgot-password",
      "method": "POST",
      "input": {"email": "string"},
      "output": {"message": "string"}
    },
    {
      "path": "/api/auth/reset-password",
      "method": "POST",
      "input": {
        "token": "string",
        "newPassword": "string"
      },
      "output": {"success": "boolean"}
    }
  ],
  "databaseSchema": {
    "password_reset_tokens": {
      "columns": ["id", "user_id", "token_hash", "expires_at", "used_at", "created_at"]
    },
    "password_history": {
      "columns": ["id", "user_id", "password_hash", "created_at"]
    }
  },
  "sprintPlan": {
    "tasks": [
      {
        "id": "TASK-001",
        "title": "Database schema migrations",
        "estimate": "2h",
        "assignee": "Dev1"
      },
      {
        "id": "TASK-002",
        "title": "Implement forgot-password endpoint",
        "estimate": "4h",
        "assignee": "Dev2",
        "dependsOn": ["TASK-001"]
      }
    ]
  }
}
```

**Key Outputs That Become Inputs:**
- `apiEndpoints` → Used by Design Note Agent (be-002)
- `databaseSchema` → Used by Design Note Agent (be-002)
- `technicalApproach` → Used by Implementation Agent (be-003)

---

## Step 3: Design Note Agent (be-002)

### Input (From be-001)
```typescript
// Receives technical_spec from Planning Agent
{
  "technicalSpecification": {
    "source": "be-001",
    "documentId": "SPEC-PWD-RESET-001",
    "apiEndpoints": [/* from Step 2 */],
    "databaseSchema": {/* from Step 2 */}
  }
}
```

### Agent Processes
1. Creates OpenAPI specification
2. Defines request/response schemas
3. Documents error responses
4. Specifies security requirements

### Output: `api_spec`
```yaml
openapi: 3.0.3
info:
  title: Password Reset API
  version: 1.0.0

paths:
  /api/auth/forgot-password:
    post:
      summary: Request password reset
      operationId: forgotPassword
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email]
              properties:
                email:
                  type: string
                  format: email
                  example: "user@example.com"
      responses:
        '200':
          description: Reset email sent (always returns 200 to prevent email enumeration)
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: "If the email exists, a reset link has been sent"
        '429':
          description: Too many requests
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /api/auth/reset-password:
    post:
      summary: Reset password with token
      operationId: resetPassword
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [token, newPassword]
              properties:
                token:
                  type: string
                  example: "a1b2c3d4e5f6..."
                newPassword:
                  type: string
                  format: password
                  minLength: 8
                  example: "NewSecure123!"
      responses:
        '200':
          description: Password reset successful
        '400':
          description: Invalid or expired token
        '422':
          description: Password does not meet requirements

components:
  schemas:
    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
```

**Stored in orchestrator as:**
```json
{
  "api_spec": {
    "documentId": "API-PWD-RESET-001",
    "basedOn": ["SPEC-PWD-RESET-001"],
    "format": "openapi-3.0.3",
    "content": "... full OpenAPI YAML above ..."
  }
}
```

**Key Outputs That Become Inputs:**
- `api_spec` → Used by Implementation Agent (be-003)
- `requestSchemas` → Used by Implementation Agent for validation
- `responseSchemas` → Used by Implementation Agent for responses

---

## Step 4: Implementation Agent (be-003)

### Input (From be-002 and be-001)
```typescript
// Receives both API spec and technical spec
{
  "apiSpecification": {
    "source": "be-002",
    "documentId": "API-PWD-RESET-001",
    "content": "... OpenAPI spec from Step 3 ..."
  },
  "technicalApproach": {
    "source": "be-001",
    "securityMeasures": [/* from Step 2 */],
    "tokenGeneration": "Crypto-secure random token"
  }
}
```

### Agent Processes
1. Implements API endpoints
2. Creates database migrations
3. Implements business logic
4. Adds security measures
5. Integrates external services

### Output: `source_code`
```json
{
  "documentId": "IMPL-PWD-RESET-001",
  "basedOn": ["API-PWD-RESET-001", "SPEC-PWD-RESET-001"],
  "files": [
    {
      "path": "src/auth/password-reset.service.ts",
      "content": "import { Injectable } from '@nestjs/common';\nimport { InjectRepository } from '@nestjs/typeorm';\nimport { Repository } from 'typeorm';\nimport * as crypto from 'crypto';\nimport * as bcrypt from 'bcrypt';\nimport { User } from '../users/entities/user.entity';\nimport { PasswordResetToken } from './entities/password-reset-token.entity';\nimport { PasswordHistory } from './entities/password-history.entity';\nimport { EmailService } from '../email/email.service';\n\n@Injectable()\nexport class PasswordResetService {\n  constructor(\n    @InjectRepository(User)\n    private userRepository: Repository<User>,\n    @InjectRepository(PasswordResetToken)\n    private tokenRepository: Repository<PasswordResetToken>,\n    @InjectRepository(PasswordHistory)\n    private historyRepository: Repository<PasswordHistory>,\n    private emailService: EmailService,\n  ) {}\n\n  async requestPasswordReset(email: string): Promise<void> {\n    // Find user (don't reveal if email exists)\n    const user = await this.userRepository.findOne({ where: { email } });\n\n    if (!user) {\n      // Return success even if user doesn't exist (prevent email enumeration)\n      return;\n    }\n\n    // Generate secure token\n    const token = crypto.randomBytes(32).toString('hex');\n    const tokenHash = await bcrypt.hash(token, 10);\n\n    // Store token in database\n    const resetToken = this.tokenRepository.create({\n      userId: user.id,\n      tokenHash,\n      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour\n    });\n    await this.tokenRepository.save(resetToken);\n\n    // Send email with reset link\n    const resetLink = `https://example.com/reset-password?token=${token}`;\n    await this.emailService.sendPasswordResetEmail(user.email, resetLink);\n  }\n\n  async resetPassword(token: string, newPassword: string): Promise<void> {\n    // Hash the provided token to compare with database\n    const tokens = await this.tokenRepository.find({\n      where: { expiresAt: MoreThan(new Date()) },\n      relations: ['user'],\n    });\n\n    // Find matching token\n    let resetToken: PasswordResetToken | null = null;\n    for (const t of tokens) {\n      const isMatch = await bcrypt.compare(token, t.tokenHash);\n      if (isMatch) {\n        resetToken = t;\n        break;\n      }\n    }\n\n    if (!resetToken) {\n      throw new BadRequestException('Invalid or expired token');\n    }\n\n    if (resetToken.usedAt) {\n      throw new BadRequestException('Token already used');\n    }\n\n    // Check password history (last 5 passwords)\n    const history = await this.historyRepository.find({\n      where: { userId: resetToken.userId },\n      order: { createdAt: 'DESC' },\n      take: 5,\n    });\n\n    for (const oldPassword of history) {\n      const isReused = await bcrypt.compare(newPassword, oldPassword.passwordHash);\n      if (isReused) {\n        throw new UnprocessableEntityException('Cannot reuse recent passwords');\n      }\n    }\n\n    // Hash new password\n    const passwordHash = await bcrypt.hash(newPassword, 10);\n\n    // Update user password\n    await this.userRepository.update(resetToken.userId, { passwordHash });\n\n    // Save to password history\n    const historyEntry = this.historyRepository.create({\n      userId: resetToken.userId,\n      passwordHash,\n    });\n    await this.historyRepository.save(historyEntry);\n\n    // Mark token as used\n    resetToken.usedAt = new Date();\n    await this.tokenRepository.save(resetToken);\n  }\n}"
    },
    {
      "path": "database/migrations/001-add-password-reset-tables.ts",
      "content": "... migration code ..."
    }
  ]
}
```

**Key Outputs That Become Inputs:**
- `source_code` → Used by Unit Test Agent (be-005)
- `files` → Used by Code Review Agent (be-004)

---

## Step 5: Unit Test Agent (be-005)

### Input (From be-003)
```typescript
// Receives source code from Implementation Agent
{
  "sourceCode": {
    "source": "be-003",
    "documentId": "IMPL-PWD-RESET-001",
    "files": [
      {
        "path": "src/auth/password-reset.service.ts",
        "content": "... full source code ...",
        "methods": ["requestPasswordReset", "resetPassword"]
      }
    ]
  }
}
```

### Agent Processes
1. Analyzes source code
2. Identifies test cases
3. Writes unit tests
4. Generates test coverage report

### Output: `test_code`
```json
{
  "documentId": "TEST-PWD-RESET-001",
  "basedOn": ["IMPL-PWD-RESET-001"],
  "testFiles": [
    {
      "path": "src/auth/password-reset.service.spec.ts",
      "testsCount": 12,
      "content": "describe('PasswordResetService', () => {\n  describe('requestPasswordReset', () => {\n    it('should generate secure token and send email', async () => {\n      // Arrange\n      const email = 'test@example.com';\n      userRepository.findOne.mockResolvedValue(mockUser);\n\n      // Act\n      await service.requestPasswordReset(email);\n\n      // Assert\n      expect(tokenRepository.save).toHaveBeenCalled();\n      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(\n        email,\n        expect.stringContaining('reset-password?token=')\n      );\n    });\n\n    it('should not reveal if email does not exist', async () => {\n      // Arrange\n      userRepository.findOne.mockResolvedValue(null);\n\n      // Act\n      await service.requestPasswordReset('nonexistent@example.com');\n\n      // Assert - should not throw error\n      expect(tokenRepository.save).not.toHaveBeenCalled();\n    });\n\n    it('should set token expiration to 1 hour', async () => {\n      // Test implementation\n    });\n  });\n\n  describe('resetPassword', () => {\n    it('should reset password with valid token', async () => {\n      // Test implementation\n    });\n\n    it('should reject expired token', async () => {\n      // Test implementation\n    });\n\n    it('should reject reused password', async () => {\n      // Arrange\n      const newPassword = 'OldPassword123!';\n      historyRepository.find.mockResolvedValue([\n        { passwordHash: await bcrypt.hash(newPassword, 10) }\n      ]);\n\n      // Act & Assert\n      await expect(\n        service.resetPassword('valid-token', newPassword)\n      ).rejects.toThrow('Cannot reuse recent passwords');\n    });\n\n    it('should mark token as used after reset', async () => {\n      // Test implementation\n    });\n  });\n});"
    }
  ],
  "coverageReport": {
    "statements": 92,
    "branches": 88,
    "functions": 100,
    "lines": 91
  }
}
```

**Key Outputs That Become Inputs:**
- `test_code` → Used by Code Review Agent (be-004)
- `coverageReport` → Used by Code Review Agent (be-004)

---

## Step 6: Code Review Agent (be-004)

### Input (From be-003 and be-005)
```typescript
// Receives both source code and tests
{
  "codeChanges": {
    "source": "be-003",
    "documentId": "IMPL-PWD-RESET-001",
    "files": [/* implementation files */]
  },
  "tests": {
    "source": "be-005",
    "documentId": "TEST-PWD-RESET-001",
    "coverage": 92,
    "testsCount": 12
  }
}
```

### Agent Processes
1. Reviews code for security issues
2. Checks best practices
3. Validates test coverage
4. Identifies performance issues
5. Generates recommendations

### Output: `review_report`
```json
{
  "documentId": "REVIEW-PWD-RESET-001",
  "basedOn": ["IMPL-PWD-RESET-001", "TEST-PWD-RESET-001"],
  "summary": {
    "criticalIssues": 0,
    "highPriorityIssues": 1,
    "mediumPriorityIssues": 2,
    "testCoverage": 92,
    "overallAssessment": "Approved with minor comments"
  },
  "highPriorityIssues": [
    {
      "id": "ISSUE-001",
      "category": "Performance",
      "title": "Sequential password comparison is inefficient",
      "location": "src/auth/password-reset.service.ts:65",
      "description": "Comparing token with all valid tokens sequentially is slow",
      "recommendation": "Add index on token_hash or use database query for comparison",
      "suggestedFix": "// Use database query with WHERE clause instead of fetching all"
    }
  ],
  "positiveFindings": [
    "✅ Prevents email enumeration",
    "✅ Secure token generation with crypto.randomBytes",
    "✅ Token hashing prevents token theft if database compromised",
    "✅ Password history prevents reuse",
    "✅ Excellent test coverage (92%)"
  ],
  "approvalStatus": "approved-with-comments"
}
```

**Key Outputs That Become Inputs:**
- `review_report` → Used by E2E Test Agent (test-003) to know what to focus on
- `approvalStatus` → Used by orchestrator to decide whether to continue

---

## Step 7: E2E Test Agent (test-003)

### Input (From multiple agents)
```typescript
// Receives API spec and review report
{
  "apiSpecification": {
    "source": "be-002",
    "endpoints": [
      "/api/auth/forgot-password",
      "/api/auth/reset-password"
    ]
  },
  "reviewReport": {
    "source": "be-004",
    "focusAreas": ["email enumeration protection", "token validation"]
  },
  "applicationUrl": "http://localhost:3000"
}
```

### Agent Processes
1. Creates E2E test scenarios
2. Implements automated tests
3. Executes tests
4. Analyzes results
5. Generates test report

### Output: `e2e_test_results`
```json
{
  "documentId": "E2E-PWD-RESET-001",
  "basedOn": ["API-PWD-RESET-001", "REVIEW-PWD-RESET-001"],
  "automationScripts": [
    {
      "path": "tests/e2e/password-reset.spec.ts",
      "content": "test('complete password reset flow', async ({ request }) => {\n  // Step 1: Request password reset\n  const resetResponse = await request.post('/api/auth/forgot-password', {\n    data: { email: 'test@example.com' }\n  });\n  expect(resetResponse.status()).toBe(200);\n\n  // Step 2: Get reset token from email (mock)\n  const token = await getTokenFromMockEmail('test@example.com');\n\n  // Step 3: Reset password\n  const newPassword = 'NewSecure123!';\n  const passwordResponse = await request.post('/api/auth/reset-password', {\n    data: { token, newPassword }\n  });\n  expect(passwordResponse.status()).toBe(200);\n\n  // Step 4: Verify can login with new password\n  const loginResponse = await request.post('/api/auth/login', {\n    data: { email: 'test@example.com', password: newPassword }\n  });\n  expect(loginResponse.status()).toBe(200);\n});\n\ntest('should not reveal if email exists', async ({ request }) => {\n  const response1 = await request.post('/api/auth/forgot-password', {\n    data: { email: 'existing@example.com' }\n  });\n  const response2 = await request.post('/api/auth/forgot-password', {\n    data: { email: 'nonexistent@example.com' }\n  });\n\n  // Both should return same response to prevent enumeration\n  expect(response1.status()).toBe(200);\n  expect(response2.status()).toBe(200);\n});"
    }
  ],
  "testResults": {
    "totalTests": 8,
    "passed": 8,
    "failed": 0,
    "duration": "12s"
  },
  "securityValidation": {
    "emailEnumerationProtection": "✅ Verified",
    "tokenExpiration": "✅ Works correctly",
    "tokenReuse": "✅ Prevented",
    "passwordHistoryCheck": "✅ Enforced"
  }
}
```

---

## Data Flow Summary

```
User Input
    ↓
[arch-002] → REQ-PWD-RESET-001 (requirements_doc)
    ↓
[be-001] → SPEC-PWD-RESET-001 (technical_spec)
    ↓
[be-002] → API-PWD-RESET-001 (api_spec)
    ↓
[be-003] → IMPL-PWD-RESET-001 (source_code)
    ↓
[be-005] → TEST-PWD-RESET-001 (test_code)
    ↓
[be-004] → REVIEW-PWD-RESET-001 (review_report)
    ↓
[test-003] → E2E-PWD-RESET-001 (e2e_test_results)
    ↓
Production Ready Code ✅
```

## Orchestrator Code Flow

```typescript
// Simplified orchestrator execution
const orchestrator = new AgentOrchestrator();

// Step 1: Requirements Analysis
const req_doc = await orchestrator.executeAgent('arch-002', {
  businessRequirements: userInput
});

// Step 2: Planning (uses req_doc from Step 1)
const tech_spec = await orchestrator.executeAgent('be-001', {
  requirements: req_doc
});

// Step 3: API Design (uses tech_spec from Step 2)
const api_spec = await orchestrator.executeAgent('be-002', {
  technicalSpecification: tech_spec
});

// Step 4: Implementation (uses api_spec from Step 3)
const source_code = await orchestrator.executeAgent('be-003', {
  apiSpecification: api_spec,
  technicalApproach: tech_spec.technicalApproach
});

// Step 5: Unit Tests (uses source_code from Step 4)
const test_code = await orchestrator.executeAgent('be-005', {
  sourceCode: source_code
});

// Step 6: Code Review (uses source_code and test_code)
const review_report = await orchestrator.executeAgent('be-004', {
  codeChanges: source_code,
  tests: test_code
});

// Step 7: E2E Tests (uses api_spec and review_report)
const e2e_results = await orchestrator.executeAgent('test-003', {
  apiSpecification: api_spec,
  reviewReport: review_report
});

// All artifacts stored and traceable
console.log(orchestrator.getAllArtifacts());
```

This demonstrates the complete data flow where each agent's output becomes the next agent's input, creating a fully traceable and automated workflow.
