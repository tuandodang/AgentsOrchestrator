# Agent Data Flow: Steps 5-7 (Testing & Review)

This document shows the final steps of the workflow: Unit Testing, Code Review, and E2E Testing.

## Step 5: Unit Testing

### Agent: `be-005` (Unit Test Agent)

### Input: Uses `source_code` from Implementation Agent (Step 4)

```json
{
  "sourceCode": {
    "source": "be-003",
    "documentId": "IMPL-001",
    "files": [
      {
        "path": "src/users/users.service.ts",
        "content": "<full service code>",
        "methods": [
          "create",
          "findAll",
          "findOne",
          "update",
          "remove"
        ]
      },
      {
        "path": "src/users/users.controller.ts",
        "content": "<full controller code>"
      }
    ]
  },
  "testFramework": "Jest",
  "coverageTarget": 80,
  "testTypes": ["unit", "integration"]
}
```

### Output: `test_code`

```json
{
  "metadata": {
    "documentId": "TEST-001",
    "version": "1.0",
    "createdAt": "2025-01-15T14:00:00Z",
    "createdBy": "be-005",
    "basedOn": ["IMPL-001"],
    "framework": "Jest",
    "coverageAchieved": 87
  },
  "testFiles": [
    {
      "path": "src/users/users.service.spec.ts",
      "type": "unit-test",
      "testsCount": 15,
      "content": "import { Test, TestingModule } from '@nestjs/testing';\nimport { ConflictException, NotFoundException } from '@nestjs/common';\nimport { getRepositoryToken } from '@nestjs/typeorm';\nimport { Repository } from 'typeorm';\nimport { EventEmitter2 } from '@nestjs/event-emitter';\nimport * as bcrypt from 'bcrypt';\nimport { UsersService } from './users.service';\nimport { User } from './entities/user.entity';\nimport { CreateUserDto } from './dto/create-user.dto';\nimport { UpdateUserDto } from './dto/update-user.dto';\n\njest.mock('bcrypt');\n\ndescribe('UsersService', () => {\n  let service: UsersService;\n  let repository: jest.Mocked<Repository<User>>;\n  let eventEmitter: jest.Mocked<EventEmitter2>;\n\n  const mockUser: User = {\n    id: '550e8400-e29b-41d4-a716-446655440000',\n    email: 'test@example.com',\n    passwordHash: 'hashedpassword123',\n    firstName: 'John',\n    lastName: 'Doe',\n    role: 'user',\n    isActive: true,\n    emailVerified: false,\n    failedLoginAttempts: 0,\n    lockedUntil: null,\n    createdAt: new Date('2025-01-15T12:00:00Z'),\n    updatedAt: new Date('2025-01-15T12:00:00Z'),\n  };\n\n  beforeEach(async () => {\n    const mockRepository = {\n      findOne: jest.fn(),\n      find: jest.fn(),\n      findAndCount: jest.fn(),\n      create: jest.fn(),\n      save: jest.fn(),\n      delete: jest.fn(),\n    };\n\n    const mockEventEmitter = {\n      emit: jest.fn(),\n    };\n\n    const module: TestingModule = await Test.createTestingModule({\n      providers: [\n        UsersService,\n        {\n          provide: getRepositoryToken(User),\n          useValue: mockRepository,\n        },\n        {\n          provide: EventEmitter2,\n          useValue: mockEventEmitter,\n        },\n      ],\n    }).compile();\n\n    service = module.get<UsersService>(UsersService);\n    repository = module.get(getRepositoryToken(User));\n    eventEmitter = module.get(EventEmitter2);\n  });\n\n  afterEach(() => {\n    jest.clearAllMocks();\n  });\n\n  describe('create', () => {\n    const createUserDto: CreateUserDto = {\n      email: 'newuser@example.com',\n      password: 'SecurePass123!',\n      firstName: 'Jane',\n      lastName: 'Smith',\n      role: 'user',\n    };\n\n    it('should create a new user successfully', async () => {\n      // Arrange\n      repository.findOne.mockResolvedValue(null); // No existing user\n      repository.create.mockReturnValue(mockUser as any);\n      repository.save.mockResolvedValue(mockUser as any);\n      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword123');\n\n      // Act\n      const result = await service.create(createUserDto);\n\n      // Assert\n      expect(repository.findOne).toHaveBeenCalledWith({\n        where: { email: createUserDto.email },\n      });\n      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);\n      expect(repository.create).toHaveBeenCalledWith({\n        email: createUserDto.email,\n        passwordHash: 'hashedpassword123',\n        firstName: createUserDto.firstName,\n        lastName: createUserDto.lastName,\n        role: createUserDto.role,\n      });\n      expect(repository.save).toHaveBeenCalledWith(mockUser);\n      expect(eventEmitter.emit).toHaveBeenCalledWith(\n        'user.created',\n        expect.any(Object),\n      );\n      expect(result).toEqual({\n        id: mockUser.id,\n        email: mockUser.email,\n        firstName: mockUser.firstName,\n        lastName: mockUser.lastName,\n        role: mockUser.role,\n        isActive: mockUser.isActive,\n        emailVerified: mockUser.emailVerified,\n        createdAt: mockUser.createdAt,\n        updatedAt: mockUser.updatedAt,\n      });\n    });\n\n    it('should throw ConflictException when email already exists', async () => {\n      // Arrange\n      repository.findOne.mockResolvedValue(mockUser as any);\n\n      // Act & Assert\n      await expect(service.create(createUserDto)).rejects.toThrow(\n        new ConflictException('Email already exists'),\n      );\n      expect(repository.save).not.toHaveBeenCalled();\n      expect(bcrypt.hash).not.toHaveBeenCalled();\n    });\n\n    it('should hash password with bcrypt using 10 rounds', async () => {\n      // Arrange\n      repository.findOne.mockResolvedValue(null);\n      repository.create.mockReturnValue(mockUser as any);\n      repository.save.mockResolvedValue(mockUser as any);\n      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword123');\n\n      // Act\n      await service.create(createUserDto);\n\n      // Assert\n      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);\n    });\n\n    it('should emit user.created event after successful creation', async () => {\n      // Arrange\n      repository.findOne.mockResolvedValue(null);\n      repository.create.mockReturnValue(mockUser as any);\n      repository.save.mockResolvedValue(mockUser as any);\n      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword123');\n\n      // Act\n      await service.create(createUserDto);\n\n      // Assert\n      expect(eventEmitter.emit).toHaveBeenCalledWith(\n        'user.created',\n        expect.objectContaining({\n          userId: mockUser.id,\n          email: mockUser.email,\n        }),\n      );\n    });\n\n    it('should default role to user if not provided', async () => {\n      // Arrange\n      const dtoWithoutRole = { ...createUserDto };\n      delete dtoWithoutRole.role;\n      repository.findOne.mockResolvedValue(null);\n      repository.create.mockReturnValue(mockUser as any);\n      repository.save.mockResolvedValue(mockUser as any);\n      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword123');\n\n      // Act\n      await service.create(dtoWithoutRole);\n\n      // Assert\n      expect(repository.create).toHaveBeenCalledWith(\n        expect.objectContaining({ role: 'user' }),\n      );\n    });\n  });\n\n  describe('findAll', () => {\n    it('should return paginated users', async () => {\n      // Arrange\n      const users = [mockUser, { ...mockUser, id: 'another-id' }];\n      repository.findAndCount.mockResolvedValue([users as any, 2]);\n\n      // Act\n      const result = await service.findAll(1, 20);\n\n      // Assert\n      expect(repository.findAndCount).toHaveBeenCalledWith({\n        where: {},\n        skip: 0,\n        take: 20,\n        order: { createdAt: 'DESC' },\n      });\n      expect(result.data).toHaveLength(2);\n      expect(result.pagination).toEqual({\n        page: 1,\n        limit: 20,\n        total: 2,\n        totalPages: 1,\n      });\n    });\n\n    it('should filter by role when provided', async () => {\n      // Arrange\n      repository.findAndCount.mockResolvedValue([[], 0]);\n\n      // Act\n      await service.findAll(1, 20, 'admin');\n\n      // Assert\n      expect(repository.findAndCount).toHaveBeenCalledWith(\n        expect.objectContaining({\n          where: { role: 'admin' },\n        }),\n      );\n    });\n\n    it('should calculate correct skip for page 2', async () => {\n      // Arrange\n      repository.findAndCount.mockResolvedValue([[], 50]);\n\n      // Act\n      await service.findAll(2, 20);\n\n      // Assert\n      expect(repository.findAndCount).toHaveBeenCalledWith(\n        expect.objectContaining({\n          skip: 20, // (2-1) * 20\n        }),\n      );\n    });\n\n    it('should calculate totalPages correctly', async () => {\n      // Arrange\n      repository.findAndCount.mockResolvedValue([[], 47]);\n\n      // Act\n      const result = await service.findAll(1, 20);\n\n      // Assert\n      expect(result.pagination.totalPages).toBe(3); // Math.ceil(47/20)\n    });\n  });\n\n  describe('findOne', () => {\n    it('should return user when found', async () => {\n      // Arrange\n      repository.findOne.mockResolvedValue(mockUser as any);\n\n      // Act\n      const result = await service.findOne(mockUser.id);\n\n      // Assert\n      expect(repository.findOne).toHaveBeenCalledWith({\n        where: { id: mockUser.id },\n      });\n      expect(result.id).toBe(mockUser.id);\n    });\n\n    it('should throw NotFoundException when user not found', async () => {\n      // Arrange\n      repository.findOne.mockResolvedValue(null);\n\n      // Act & Assert\n      await expect(service.findOne('nonexistent-id')).rejects.toThrow(\n        new NotFoundException('User not found'),\n      );\n    });\n  });\n\n  describe('update', () => {\n    const updateUserDto: UpdateUserDto = {\n      firstName: 'UpdatedName',\n    };\n\n    it('should update user successfully', async () => {\n      // Arrange\n      repository.findOne.mockResolvedValue(mockUser as any);\n      const updatedUser = { ...mockUser, firstName: 'UpdatedName' };\n      repository.save.mockResolvedValue(updatedUser as any);\n\n      // Act\n      const result = await service.update(mockUser.id, updateUserDto);\n\n      // Assert\n      expect(repository.findOne).toHaveBeenCalledWith({\n        where: { id: mockUser.id },\n      });\n      expect(repository.save).toHaveBeenCalled();\n      expect(result.firstName).toBe('UpdatedName');\n    });\n\n    it('should throw NotFoundException when user not found', async () => {\n      // Arrange\n      repository.findOne.mockResolvedValue(null);\n\n      // Act & Assert\n      await expect(\n        service.update('nonexistent-id', updateUserDto),\n      ).rejects.toThrow(new NotFoundException('User not found'));\n    });\n\n    it('should throw ConflictException when updating to existing email', async () => {\n      // Arrange\n      repository.findOne\n        .mockResolvedValueOnce(mockUser as any) // First call: find user to update\n        .mockResolvedValueOnce({ id: 'different-id' } as any); // Second call: find existing email\n\n      // Act & Assert\n      await expect(\n        service.update(mockUser.id, { email: 'existing@example.com' }),\n      ).rejects.toThrow(new ConflictException('Email already exists'));\n    });\n  });\n\n  describe('remove', () => {\n    it('should soft delete user', async () => {\n      // Arrange\n      repository.findOne.mockResolvedValue(mockUser as any);\n      repository.save.mockResolvedValue({ ...mockUser, isActive: false } as any);\n\n      // Act\n      await service.remove(mockUser.id);\n\n      // Assert\n      expect(repository.findOne).toHaveBeenCalledWith({\n        where: { id: mockUser.id },\n      });\n      expect(repository.save).toHaveBeenCalledWith(\n        expect.objectContaining({ isActive: false }),\n      );\n    });\n\n    it('should throw NotFoundException when user not found', async () => {\n      // Arrange\n      repository.findOne.mockResolvedValue(null);\n\n      // Act & Assert\n      await expect(service.remove('nonexistent-id')).rejects.toThrow(\n        new NotFoundException('User not found'),\n      );\n      expect(repository.save).not.toHaveBeenCalled();\n    });\n  });\n});"
    },
    {
      "path": "src/users/users.controller.spec.ts",
      "type": "integration-test",
      "testsCount": 12,
      "content": "<controller integration tests>"
    }
  ],
  "coverageReport": {
    "statements": 87.5,
    "branches": 82.3,
    "functions": 90.2,
    "lines": 87.1,
    "coveredFiles": [
      {
        "file": "src/users/users.service.ts",
        "statements": 95.0,
        "branches": 88.0,
        "functions": 100.0,
        "lines": 94.5
      },
      {
        "file": "src/users/users.controller.ts",
        "statements": 80.0,
        "branches": 76.5,
        "functions": 80.0,
        "lines": 80.0
      }
    ],
    "uncoveredLines": [
      {
        "file": "src/users/users.controller.ts",
        "lines": [45, 67, 89],
        "reason": "Error handling edge cases"
      }
    ]
  },
  "testSummary": {
    "totalTests": 27,
    "passed": 27,
    "failed": 0,
    "skipped": 0,
    "duration": "2.5s"
  }
}
```

---

## Step 6: Code Review

### Agent: `be-004` (Code Review Agent)

### Input: Uses `source_code` from Step 4 and `test_code` from Step 5

```json
{
  "codeChanges": {
    "source": "be-003",
    "documentId": "IMPL-001",
    "files": ["<all implementation files>"],
    "linesChanged": 850,
    "filesChanged": 12
  },
  "tests": {
    "source": "be-005",
    "documentId": "TEST-001",
    "coverage": 87,
    "testsCount": 27
  },
  "reviewCriteria": [
    "security",
    "performance",
    "best-practices",
    "testability",
    "maintainability"
  ]
}
```

### Output: `review_report`

```json
{
  "metadata": {
    "documentId": "REVIEW-001",
    "version": "1.0",
    "createdAt": "2025-01-15T15:00:00Z",
    "createdBy": "be-004",
    "basedOn": ["IMPL-001", "TEST-001"],
    "reviewStatus": "approved-with-comments"
  },
  "summary": {
    "filesReviewed": 12,
    "criticalIssues": 0,
    "highPriorityIssues": 2,
    "mediumPriorityIssues": 5,
    "lowPriorityIssues": 3,
    "positiveFindings": 8,
    "overallAssessment": "Good implementation with minor improvements needed"
  },
  "criticalIssues": [],
  "highPriorityIssues": [
    {
      "id": "ISSUE-001",
      "file": "src/users/users.service.ts",
      "line": 45,
      "category": "Security",
      "severity": "High",
      "title": "Timing Attack Vulnerability in Email Check",
      "description": "The email existence check reveals whether an email is registered through timing differences",
      "currentCode": "const existingUser = await this.usersRepository.findOne({\n  where: { email: createUserDto.email },\n});\n\nif (existingUser) {\n  throw new ConflictException('Email already exists');\n}",
      "recommendation": "Use constant-time comparison or add random delay to prevent timing attacks",
      "suggestedFix": "// Add random delay to prevent timing attacks\nconst delay = Math.random() * 100 + 50; // 50-150ms\nawait new Promise(resolve => setTimeout(resolve, delay));\n\nconst existingUser = await this.usersRepository.findOne({\n  where: { email: createUserDto.email },\n});\n\nif (existingUser) {\n  throw new ConflictException('Email already exists');\n}",
      "impact": "Attackers can enumerate registered emails",
      "references": ["CWE-208: Observable Timing Discrepancy"]
    },
    {
      "id": "ISSUE-002",
      "file": "src/users/users.service.ts",
      "line": 78,
      "category": "Performance",
      "severity": "High",
      "title": "N+1 Query Potential in Future User Relations",
      "description": "Service doesn't use eager loading for potential future relations",
      "currentCode": "const user = await this.usersRepository.findOne({ where: { id } });",
      "recommendation": "Consider using query builder with relations parameter for future scalability",
      "suggestedFix": "const user = await this.usersRepository.findOne({\n  where: { id },\n  relations: [], // Add relations here when needed\n});",
      "impact": "Could cause performance issues when user relations are added",
      "references": ["TypeORM Best Practices"]
    }
  ],
  "mediumPriorityIssues": [
    {
      "id": "ISSUE-003",
      "file": "src/users/users.controller.ts",
      "line": 34,
      "category": "Best Practices",
      "severity": "Medium",
      "title": "Missing Rate Limiting on Login-Related Endpoints",
      "description": "No rate limiting implemented on user creation and authentication endpoints",
      "recommendation": "Implement rate limiting using @nestjs/throttler",
      "suggestedFix": "@Throttle(5, 60) // 5 requests per 60 seconds\n@Post()\nasync create(@Body() createUserDto: CreateUserDto) {\n  // ... \n}",
      "impact": "Vulnerable to brute force attacks",
      "references": ["OWASP: Brute Force Attack"]
    },
    {
      "id": "ISSUE-004",
      "file": "src/users/users.service.ts",
      "line": 120,
      "category": "Maintainability",
      "severity": "Medium",
      "title": "Magic Number in Bcrypt Rounds",
      "description": "Bcrypt rounds hardcoded as 10 instead of using configuration",
      "currentCode": "private readonly BCRYPT_ROUNDS = 10;",
      "recommendation": "Move to configuration file",
      "suggestedFix": "// In configuration\nexport default {\n  security: {\n    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),\n  },\n};\n\n// In service\nconstructor(\n  private configService: ConfigService,\n) {\n  this.bcryptRounds = this.configService.get('security.bcryptRounds');\n}",
      "impact": "Hard to change security parameters without code changes"
    },
    {
      "id": "ISSUE-005",
      "file": "src/users/dto/create-user.dto.ts",
      "line": 25,
      "category": "Security",
      "severity": "Medium",
      "title": "Password Regex Could Be More Restrictive",
      "description": "Password validation allows some weak patterns",
      "currentCode": "@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]/)",
      "recommendation": "Add maximum length and prevent common patterns",
      "suggestedFix": "@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,128}$/)\n@MaxLength(128)",
      "impact": "Could allow overly long passwords that cause DoS"
    }
  ],
  "lowPriorityIssues": [
    {
      "id": "ISSUE-006",
      "file": "src/users/users.service.ts",
      "line": 55,
      "category": "Code Quality",
      "severity": "Low",
      "title": "Inconsistent Logging Levels",
      "description": "Some operations log at info level, others at debug",
      "recommendation": "Establish consistent logging strategy",
      "impact": "Makes debugging harder"
    },
    {
      "id": "ISSUE-007",
      "file": "src/users/users.controller.ts",
      "line": 89,
      "category": "Documentation",
      "severity": "Low",
      "title": "Missing API Documentation for Error Responses",
      "description": "Not all error responses documented in Swagger",
      "recommendation": "Add @ApiResponse decorators for all possible error codes",
      "impact": "API consumers don't know all possible error responses"
    },
    {
      "id": "ISSUE-008",
      "file": "src/users/entities/user.entity.ts",
      "line": 15,
      "category": "Best Practices",
      "severity": "Low",
      "title": "Missing Index on Compound Queries",
      "description": "No compound index for common query patterns",
      "recommendation": "Add compound index for (role, is_active, created_at)",
      "impact": "Slower queries when filtering by multiple fields"
    }
  ],
  "positiveFindings": [
    {
      "category": "Security",
      "finding": "Proper password hashing with bcrypt",
      "location": "src/users/users.service.ts:42"
    },
    {
      "category": "Security",
      "finding": "Input validation using class-validator",
      "location": "src/users/dto/*.dto.ts"
    },
    {
      "category": "Security",
      "finding": "UUID used for user IDs (prevents enumeration)",
      "location": "src/users/entities/user.entity.ts:8"
    },
    {
      "category": "Best Practices",
      "finding": "Soft delete implemented for audit trail",
      "location": "src/users/users.service.ts:145"
    },
    {
      "category": "Testing",
      "finding": "Excellent test coverage (87%)",
      "location": "Test files"
    },
    {
      "category": "Architecture",
      "finding": "Clean separation of concerns (Controller/Service/Repository)",
      "location": "Overall structure"
    },
    {
      "category": "Error Handling",
      "finding": "Proper use of NestJS exceptions",
      "location": "Throughout service layer"
    },
    {
      "category": "Documentation",
      "finding": "Good OpenAPI/Swagger documentation",
      "location": "Controller decorators"
    }
  ],
  "metrics": {
    "codeComplexity": {
      "cyclomaticComplexity": 12,
      "cognitiveComplexity": 8,
      "assessment": "Good - within acceptable limits"
    },
    "codeQuality": {
      "duplicatedCode": "0%",
      "technicalDebt": "2 hours",
      "maintainabilityIndex": 82
    },
    "security": {
      "vulnerabilities": {
        "critical": 0,
        "high": 0,
        "medium": 2,
        "low": 0
      },
      "securityScore": 85
    }
  },
  "recommendations": {
    "mustFix": [
      "Implement rate limiting on authentication endpoints",
      "Add timing attack protection for email enumeration"
    ],
    "shouldFix": [
      "Move bcrypt rounds to configuration",
      "Improve password regex validation",
      "Add compound database indexes"
    ],
    "niceToHave": [
      "Improve logging consistency",
      "Complete API documentation for all error responses"
    ]
  },
  "actionItems": [
    {
      "task": "Add @nestjs/throttler and configure rate limiting",
      "assignee": "Dev1",
      "priority": "High",
      "estimatedEffort": "2 hours"
    },
    {
      "task": "Implement timing attack protection",
      "assignee": "Dev2",
      "priority": "High",
      "estimatedEffort": "1 hour"
    },
    {
      "task": "Move security configurations to config file",
      "assignee": "Dev3",
      "priority": "Medium",
      "estimatedEffort": "1 hour"
    }
  ],
  "approvalStatus": "approved-with-comments",
  "nextSteps": [
    "Address high-priority issues",
    "Re-run security scan",
    "Proceed to E2E testing"
  ]
}
```

---

## Step 7: End-to-End Testing

### Agent: `test-003` (E2E Test Agent)

### Input: Uses multiple inputs from previous steps

```json
{
  "testCases": {
    "source": "test-002",
    "documentId": "TC-001",
    "scenarios": [
      {
        "id": "TC-E2E-001",
        "title": "User Registration and Login Flow",
        "steps": ["Register new user", "Verify email", "Login", "Access protected resource"]
      },
      {
        "id": "TC-E2E-002",
        "title": "Admin User Management Flow",
        "steps": ["Admin login", "Create user", "Update user", "Deactivate user"]
      }
    ]
  },
  "applicationUrl": "http://localhost:3000",
  "automationFramework": "Playwright",
  "browsers": ["chromium", "firefox"]
}
```

### Output: `e2e_test_results`

```json
{
  "metadata": {
    "documentId": "E2E-001",
    "version": "1.0",
    "createdAt": "2025-01-15T16:00:00Z",
    "createdBy": "test-003",
    "basedOn": ["TC-001", "API-001"],
    "framework": "Playwright",
    "executionTime": "45 seconds"
  },
  "automationScripts": [
    {
      "path": "tests/e2e/user-registration.spec.ts",
      "content": "import { test, expect } from '@playwright/test';\nimport { faker } from '@faker-js/faker';\n\ntest.describe('User Registration and Authentication Flow', () => {\n  let userEmail: string;\n  let userPassword: string;\n\n  test.beforeEach(() => {\n    // Generate unique test data\n    userEmail = faker.internet.email();\n    userPassword = 'Test@123!';\n  });\n\n  test('should complete full user registration flow', async ({ page, request }) => {\n    // Step 1: Register new user via API\n    const registerResponse = await request.post('/api/v1/users', {\n      data: {\n        email: userEmail,\n        password: userPassword,\n        firstName: 'Test',\n        lastName: 'User',\n        role: 'user',\n      },\n      headers: {\n        'Authorization': 'Bearer ADMIN_TOKEN', // Admin creates user\n      },\n    });\n\n    expect(registerResponse.status()).toBe(201);\n    const registerData = await registerResponse.json();\n    expect(registerData.success).toBe(true);\n    expect(registerData.data.email).toBe(userEmail);\n    expect(registerData.data.id).toBeDefined();\n\n    const userId = registerData.data.id;\n\n    // Step 2: Login with new credentials\n    const loginResponse = await request.post('/api/auth/login', {\n      data: {\n        email: userEmail,\n        password: userPassword,\n      },\n    });\n\n    expect(loginResponse.status()).toBe(200);\n    const loginData = await loginResponse.json();\n    expect(loginData.success).toBe(true);\n    expect(loginData.data.accessToken).toBeDefined();\n    expect(loginData.data.user.email).toBe(userEmail);\n\n    const accessToken = loginData.data.accessToken;\n\n    // Step 3: Access protected resource\n    const profileResponse = await request.get(`/api/v1/users/${userId}`, {\n      headers: {\n        'Authorization': `Bearer ${accessToken}`,\n      },\n    });\n\n    expect(profileResponse.status()).toBe(200);\n    const profileData = await profileResponse.json();\n    expect(profileData.data.email).toBe(userEmail);\n  });\n\n  test('should reject registration with duplicate email', async ({ request }) => {\n    // Register first user\n    await request.post('/api/v1/users', {\n      data: {\n        email: userEmail,\n        password: userPassword,\n        firstName: 'Test',\n        lastName: 'User',\n      },\n      headers: {\n        'Authorization': 'Bearer ADMIN_TOKEN',\n      },\n    });\n\n    // Try to register with same email\n    const duplicateResponse = await request.post('/api/v1/users', {\n      data: {\n        email: userEmail,\n        password: userPassword,\n        firstName: 'Another',\n        lastName: 'User',\n      },\n      headers: {\n        'Authorization': 'Bearer ADMIN_TOKEN',\n      },\n    });\n\n    expect(duplicateResponse.status()).toBe(409);\n    const errorData = await duplicateResponse.json();\n    expect(errorData.success).toBe(false);\n    expect(errorData.error.code).toBe('CONFLICT');\n    expect(errorData.error.message).toContain('Email already exists');\n  });\n\n  test('should enforce password complexity', async ({ request }) => {\n    const weakPasswords = [\n      'short',           // Too short\n      'alllowercase',    // No uppercase\n      'ALLUPPERCASE',    // No lowercase\n      'NoNumbers!',      // No numbers\n      'NoSpecial123',    // No special chars\n    ];\n\n    for (const weakPassword of weakPasswords) {\n      const response = await request.post('/api/v1/users', {\n        data: {\n          email: faker.internet.email(),\n          password: weakPassword,\n          firstName: 'Test',\n          lastName: 'User',\n        },\n        headers: {\n          'Authorization': 'Bearer ADMIN_TOKEN',\n        },\n      });\n\n      expect(response.status()).toBe(400);\n      const errorData = await response.json();\n      expect(errorData.error.code).toBe('VALIDATION_ERROR');\n    }\n  });\n\n  test('should handle account lockout after failed login attempts', async ({ request }) => {\n    // Register user first\n    await request.post('/api/v1/users', {\n      data: {\n        email: userEmail,\n        password: userPassword,\n        firstName: 'Test',\n        lastName: 'User',\n      },\n      headers: {\n        'Authorization': 'Bearer ADMIN_TOKEN',\n      },\n    });\n\n    // Attempt 5 failed logins\n    for (let i = 0; i < 5; i++) {\n      const response = await request.post('/api/auth/login', {\n        data: {\n          email: userEmail,\n          password: 'WrongPassword123!',\n        },\n      });\n\n      expect(response.status()).toBe(401);\n    }\n\n    // 6th attempt should result in account lockout\n    const lockoutResponse = await request.post('/api/auth/login', {\n      data: {\n        email: userEmail,\n        password: 'WrongPassword123!',\n      },\n    });\n\n    expect(lockoutResponse.status()).toBe(423); // Locked\n    const lockoutData = await lockoutResponse.json();\n    expect(lockoutData.error.code).toBe('ACCOUNT_LOCKED');\n  });\n});"
    }
  ],
  "testResults": {
    "totalTests": 8,
    "passed": 8,
    "failed": 0,
    "skipped": 0,
    "browsers": [
      {
        "name": "chromium",
        "passed": 8,
        "failed": 0,
        "duration": "22s"
      },
      {
        "name": "firefox",
        "passed": 8,
        "failed": 0,
        "duration": "23s"
      }
    ]
  },
  "performanceMetrics": {
    "averageResponseTime": "145ms",
    "p95ResponseTime": "189ms",
    "p99ResponseTime": "215ms",
    "slowestEndpoint": {
      "endpoint": "POST /api/v1/users",
      "responseTime": "215ms",
      "reason": "Password hashing"
    }
  },
  "securityValidation": {
    "authenticationTested": true,
    "authorizationTested": true,
    "inputValidationTested": true,
    "rateLimitingTested": false,
    "findings": [
      "Password complexity enforced correctly",
      "Email uniqueness validated",
      "Account lockout mechanism works",
      "JWT authentication functional"
    ]
  },
  "reportAnalysis": {
    "summary": "All E2E tests passed successfully across all browsers",
    "performanceAssessment": "Excellent - all endpoints under 200ms (p95)",
    "criticalFlows": {
      "registration": "✅ Working",
      "authentication": "✅ Working",
      "authorization": "✅ Working",
      "userManagement": "✅ Working"
    },
    "recommendations": [
      "Add performance tests for concurrent user creation",
      "Test rate limiting implementation when added",
      "Add visual regression tests for any UI components"
    ]
  },
  "screenshots": [
    {
      "test": "User Registration Flow",
      "path": "test-results/registration-success.png",
      "description": "Successful registration confirmation"
    }
  ],
  "videos": [
    {
      "test": "Full User Flow",
      "path": "test-results/full-flow.webm",
      "duration": "45s"
    }
  ]
}
```

---

## Complete Data Flow Summary

```
User Input (Business Requirements)
    ↓
REQ-001 (Requirements Document)
    ↓
ARCH-001 (Architecture Document)
    ↓
SPEC-001 (Technical Specification)
    ↓
API-001 (OpenAPI Specification)
    ↓
IMPL-001 (Source Code Implementation)
    ↓
TEST-001 (Unit Tests + Coverage Report)
    ↓
REVIEW-001 (Code Review Report)
    ↓
E2E-001 (End-to-End Test Results)
    ↓
Production Deployment ✅
```

Each document ID is traceable throughout the entire workflow, providing complete auditability and traceability from requirements to deployed code.
