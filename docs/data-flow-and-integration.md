# Data Flow: Implementation Through Testing Steps

This document continues the data flow example, showing Steps 4-7 of the workflow.

## Step 4: Implementation Agent

### Agent: `be-003` (Implementation Agent)

### Input: Uses API spec from Step 3

```json
{
  "apiSpecification": {
    "source": "be-002",
    "documentId": "API-001",
    "format": "openapi-3.0.3",
    "content": "<entire api_spec from Step 3>"
  },
  "architecture": {
    "source": "arch-001",
    "componentArchitecture": "<component structure from Step 2>",
    "databaseSchema": "<database schema from Step 2>"
  },
  "programmingLanguage": "TypeScript",
  "framework": "NestJS",
  "ormFramework": "TypeORM"
}
```

### Output: `source_code`

```json
{
  "metadata": {
    "documentId": "IMPL-001",
    "version": "1.0",
    "createdAt": "2025-01-15T13:00:00Z",
    "createdBy": "be-003",
    "basedOn": ["API-001", "ARCH-001"],
    "language": "TypeScript",
    "framework": "NestJS"
  },
  "files": [
    {
      "path": "src/users/entities/user.entity.ts",
      "type": "model",
      "content": "import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';\n\n@Entity('users')\n@Index(['email'])\n@Index(['role'])\n@Index(['createdAt'])\nexport class User {\n  @PrimaryGeneratedColumn('uuid')\n  id: string;\n\n  @Column({ unique: true, length: 255 })\n  email: string;\n\n  @Column({ name: 'password_hash', length: 255 })\n  passwordHash: string;\n\n  @Column({ name: 'first_name', length: 100 })\n  firstName: string;\n\n  @Column({ name: 'last_name', length: 100 })\n  lastName: string;\n\n  @Column({\n    type: 'enum',\n    enum: ['admin', 'user', 'moderator'],\n    default: 'user',\n  })\n  role: 'admin' | 'user' | 'moderator';\n\n  @Column({ name: 'is_active', default: true })\n  isActive: boolean;\n\n  @Column({ name: 'email_verified', default: false })\n  emailVerified: boolean;\n\n  @Column({ name: 'failed_login_attempts', default: 0 })\n  failedLoginAttempts: number;\n\n  @Column({ name: 'locked_until', nullable: true })\n  lockedUntil: Date | null;\n\n  @CreateDateColumn({ name: 'created_at' })\n  createdAt: Date;\n\n  @UpdateDateColumn({ name: 'updated_at' })\n  updatedAt: Date;\n}"
    },
    {
      "path": "src/users/dto/create-user.dto.ts",
      "type": "dto",
      "content": "import { IsEmail, IsString, MinLength, MaxLength, Matches, IsEnum, IsOptional } from 'class-validator';\nimport { ApiProperty } from '@nestjs/swagger';\n\nexport class CreateUserDto {\n  @ApiProperty({\n    description: 'User email address (must be unique)',\n    example: 'user@example.com',\n  })\n  @IsEmail({}, { message: 'Invalid email format' })\n  email: string;\n\n  @ApiProperty({\n    description: 'Password (min 8 chars, must include uppercase, lowercase, number, special char)',\n    example: 'SecurePass123!',\n    minLength: 8,\n  })\n  @IsString()\n  @MinLength(8, { message: 'Password must be at least 8 characters' })\n  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]/, {\n    message: 'Password must contain uppercase, lowercase, number, and special character',\n  })\n  password: string;\n\n  @ApiProperty({\n    description: 'First name',\n    example: 'John',\n    minLength: 1,\n    maxLength: 100,\n  })\n  @IsString()\n  @MinLength(1)\n  @MaxLength(100)\n  firstName: string;\n\n  @ApiProperty({\n    description: 'Last name',\n    example: 'Doe',\n    minLength: 1,\n    maxLength: 100,\n  })\n  @IsString()\n  @MinLength(1)\n  @MaxLength(100)\n  lastName: string;\n\n  @ApiProperty({\n    description: 'User role',\n    example: 'user',\n    enum: ['admin', 'user', 'moderator'],\n    default: 'user',\n  })\n  @IsEnum(['admin', 'user', 'moderator'])\n  @IsOptional()\n  role?: 'admin' | 'user' | 'moderator';\n}"
    },
    {
      "path": "src/users/dto/update-user.dto.ts",
      "type": "dto",
      "content": "import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsBoolean, IsOptional } from 'class-validator';\nimport { ApiPropertyOptional } from '@nestjs/swagger';\n\nexport class UpdateUserDto {\n  @ApiPropertyOptional()\n  @IsEmail()\n  @IsOptional()\n  email?: string;\n\n  @ApiPropertyOptional()\n  @IsString()\n  @MinLength(1)\n  @MaxLength(100)\n  @IsOptional()\n  firstName?: string;\n\n  @ApiPropertyOptional()\n  @IsString()\n  @MinLength(1)\n  @MaxLength(100)\n  @IsOptional()\n  lastName?: string;\n\n  @ApiPropertyOptional()\n  @IsEnum(['admin', 'user', 'moderator'])\n  @IsOptional()\n  role?: 'admin' | 'user' | 'moderator';\n\n  @ApiPropertyOptional()\n  @IsBoolean()\n  @IsOptional()\n  isActive?: boolean;\n}"
    },
    {
      "path": "src/users/dto/user-response.dto.ts",
      "type": "dto",
      "content": "import { ApiProperty } from '@nestjs/swagger';\nimport { User } from '../entities/user.entity';\n\nexport class UserResponseDto {\n  @ApiProperty()\n  id: string;\n\n  @ApiProperty()\n  email: string;\n\n  @ApiProperty()\n  firstName: string;\n\n  @ApiProperty()\n  lastName: string;\n\n  @ApiProperty()\n  role: string;\n\n  @ApiProperty()\n  isActive: boolean;\n\n  @ApiProperty()\n  emailVerified: boolean;\n\n  @ApiProperty()\n  createdAt: Date;\n\n  @ApiProperty()\n  updatedAt: Date;\n\n  static fromEntity(user: User): UserResponseDto {\n    return {\n      id: user.id,\n      email: user.email,\n      firstName: user.firstName,\n      lastName: user.lastName,\n      role: user.role,\n      isActive: user.isActive,\n      emailVerified: user.emailVerified,\n      createdAt: user.createdAt,\n      updatedAt: user.updatedAt,\n    };\n  }\n}"
    },
    {
      "path": "src/users/users.service.ts",
      "type": "service",
      "content": "import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';\nimport { InjectRepository } from '@nestjs/typeorm';\nimport { Repository } from 'typeorm';\nimport * as bcrypt from 'bcrypt';\nimport { User } from './entities/user.entity';\nimport { CreateUserDto } from './dto/create-user.dto';\nimport { UpdateUserDto } from './dto/update-user.dto';\nimport { UserResponseDto } from './dto/user-response.dto';\nimport { EventEmitter2 } from '@nestjs/event-emitter';\nimport { UserCreatedEvent } from './events/user-created.event';\n\n@Injectable()\nexport class UsersService {\n  private readonly logger = new Logger(UsersService.name);\n  private readonly BCRYPT_ROUNDS = 10;\n\n  constructor(\n    @InjectRepository(User)\n    private usersRepository: Repository<User>,\n    private eventEmitter: EventEmitter2,\n  ) {}\n\n  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {\n    this.logger.log(`Creating user with email: ${createUserDto.email}`);\n\n    // Check if user already exists\n    const existingUser = await this.usersRepository.findOne({\n      where: { email: createUserDto.email },\n    });\n\n    if (existingUser) {\n      this.logger.warn(`User with email ${createUserDto.email} already exists`);\n      throw new ConflictException('Email already exists');\n    }\n\n    // Hash password\n    const passwordHash = await bcrypt.hash(createUserDto.password, this.BCRYPT_ROUNDS);\n\n    // Create user entity\n    const user = this.usersRepository.create({\n      email: createUserDto.email,\n      passwordHash,\n      firstName: createUserDto.firstName,\n      lastName: createUserDto.lastName,\n      role: createUserDto.role || 'user',\n    });\n\n    // Save to database\n    const savedUser = await this.usersRepository.save(user);\n    this.logger.log(`User created successfully: ${savedUser.id}`);\n\n    // Publish event\n    this.eventEmitter.emit(\n      'user.created',\n      new UserCreatedEvent(savedUser.id, savedUser.email, savedUser.firstName),\n    );\n\n    return UserResponseDto.fromEntity(savedUser);\n  }\n\n  async findAll(page: number = 1, limit: number = 20, role?: string, isActive?: boolean): Promise<{\n    data: UserResponseDto[];\n    pagination: any;\n  }> {\n    const skip = (page - 1) * limit;\n\n    const where: any = {};\n    if (role) where.role = role;\n    if (isActive !== undefined) where.isActive = isActive;\n\n    const [users, total] = await this.usersRepository.findAndCount({\n      where,\n      skip,\n      take: limit,\n      order: { createdAt: 'DESC' },\n    });\n\n    return {\n      data: users.map(UserResponseDto.fromEntity),\n      pagination: {\n        page,\n        limit,\n        total,\n        totalPages: Math.ceil(total / limit),\n      },\n    };\n  }\n\n  async findOne(id: string): Promise<UserResponseDto> {\n    const user = await this.usersRepository.findOne({ where: { id } });\n\n    if (!user) {\n      throw new NotFoundException('User not found');\n    }\n\n    return UserResponseDto.fromEntity(user);\n  }\n\n  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {\n    const user = await this.usersRepository.findOne({ where: { id } });\n\n    if (!user) {\n      throw new NotFoundException('User not found');\n    }\n\n    // Check email uniqueness if changed\n    if (updateUserDto.email && updateUserDto.email !== user.email) {\n      const existingUser = await this.usersRepository.findOne({\n        where: { email: updateUserDto.email },\n      });\n\n      if (existingUser) {\n        throw new ConflictException('Email already exists');\n      }\n    }\n\n    // Update fields\n    Object.assign(user, updateUserDto);\n\n    const updatedUser = await this.usersRepository.save(user);\n    this.logger.log(`User updated: ${updatedUser.id}`);\n\n    return UserResponseDto.fromEntity(updatedUser);\n  }\n\n  async remove(id: string): Promise<void> {\n    const user = await this.usersRepository.findOne({ where: { id } });\n\n    if (!user) {\n      throw new NotFoundException('User not found');\n    }\n\n    // Soft delete\n    user.isActive = false;\n    await this.usersRepository.save(user);\n    this.logger.log(`User soft deleted: ${id}`);\n  }\n}"
    },
    {
      "path": "src/users/users.controller.ts",
      "type": "controller",
      "content": "import {\n  Controller,\n  Get,\n  Post,\n  Put,\n  Delete,\n  Body,\n  Param,\n  Query,\n  HttpCode,\n  HttpStatus,\n  UseGuards,\n  ParseUUIDPipe,\n  ParseIntPipe,\n} from '@nestjs/common';\nimport { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';\nimport { UsersService } from './users.service';\nimport { CreateUserDto } from './dto/create-user.dto';\nimport { UpdateUserDto } from './dto/update-user.dto';\nimport { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';\nimport { RolesGuard } from '../auth/guards/roles.guard';\nimport { Roles } from '../auth/decorators/roles.decorator';\n\n@ApiTags('users')\n@Controller('api/v1/users')\n@UseGuards(JwtAuthGuard, RolesGuard)\n@ApiBearerAuth()\nexport class UsersController {\n  constructor(private readonly usersService: UsersService) {}\n\n  @Post()\n  @Roles('admin')\n  @HttpCode(HttpStatus.CREATED)\n  @ApiOperation({ summary: 'Create a new user', operationId: 'createUser' })\n  @ApiResponse({ status: 201, description: 'User created successfully' })\n  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })\n  @ApiResponse({ status: 401, description: 'Unauthorized' })\n  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })\n  @ApiResponse({ status: 422, description: 'Validation error' })\n  async create(@Body() createUserDto: CreateUserDto) {\n    const user = await this.usersService.create(createUserDto);\n    return { success: true, data: user };\n  }\n\n  @Get()\n  @ApiOperation({ summary: 'List all users', operationId: 'listUsers' })\n  @ApiQuery({ name: 'page', required: false, type: Number })\n  @ApiQuery({ name: 'limit', required: false, type: Number })\n  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'user', 'moderator'] })\n  @ApiQuery({ name: 'isActive', required: false, type: Boolean })\n  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })\n  async findAll(\n    @Query('page', new ParseIntPipe({ optional: true })) page?: number,\n    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,\n    @Query('role') role?: string,\n    @Query('isActive') isActive?: boolean,\n  ) {\n    const result = await this.usersService.findAll(page || 1, limit || 20, role, isActive);\n    return { success: true, ...result };\n  }\n\n  @Get(':id')\n  @ApiOperation({ summary: 'Get user by ID', operationId: 'getUserById' })\n  @ApiResponse({ status: 200, description: 'User found' })\n  @ApiResponse({ status: 404, description: 'User not found' })\n  async findOne(@Param('id', ParseUUIDPipe) id: string) {\n    const user = await this.usersService.findOne(id);\n    return { success: true, data: user };\n  }\n\n  @Put(':id')\n  @Roles('admin')\n  @ApiOperation({ summary: 'Update user', operationId: 'updateUser' })\n  @ApiResponse({ status: 200, description: 'User updated successfully' })\n  @ApiResponse({ status: 404, description: 'User not found' })\n  @ApiResponse({ status: 409, description: 'Email already exists' })\n  async update(\n    @Param('id', ParseUUIDPipe) id: string,\n    @Body() updateUserDto: UpdateUserDto,\n  ) {\n    const user = await this.usersService.update(id, updateUserDto);\n    return { success: true, data: user };\n  }\n\n  @Delete(':id')\n  @Roles('admin')\n  @HttpCode(HttpStatus.NO_CONTENT)\n  @ApiOperation({ summary: 'Delete user', operationId: 'deleteUser' })\n  @ApiResponse({ status: 204, description: 'User deleted successfully' })\n  @ApiResponse({ status: 404, description: 'User not found' })\n  async remove(@Param('id', ParseUUIDPipe) id: string) {\n    await this.usersService.remove(id);\n  }\n}"
    }
  ],
  "databaseMigrations": [
    {
      "path": "src/database/migrations/1642253400000-CreateUsersTable.ts",
      "content": "import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';\n\nexport class CreateUsersTable1642253400000 implements MigrationInterface {\n  public async up(queryRunner: QueryRunner): Promise<void> {\n    await queryRunner.createTable(\n      new Table({\n        name: 'users',\n        columns: [\n          {\n            name: 'id',\n            type: 'uuid',\n            isPrimary: true,\n            generationStrategy: 'uuid',\n            default: 'uuid_generate_v4()',\n          },\n          {\n            name: 'email',\n            type: 'varchar',\n            length: '255',\n            isUnique: true,\n            isNullable: false,\n          },\n          {\n            name: 'password_hash',\n            type: 'varchar',\n            length: '255',\n            isNullable: false,\n          },\n          {\n            name: 'first_name',\n            type: 'varchar',\n            length: '100',\n            isNullable: false,\n          },\n          {\n            name: 'last_name',\n            type: 'varchar',\n            length: '100',\n            isNullable: false,\n          },\n          {\n            name: 'role',\n            type: 'varchar',\n            length: '50',\n            default: \"'user'\",\n            isNullable: false,\n          },\n          {\n            name: 'is_active',\n            type: 'boolean',\n            default: true,\n          },\n          {\n            name: 'email_verified',\n            type: 'boolean',\n            default: false,\n          },\n          {\n            name: 'failed_login_attempts',\n            type: 'integer',\n            default: 0,\n          },\n          {\n            name: 'locked_until',\n            type: 'timestamp',\n            isNullable: true,\n          },\n          {\n            name: 'created_at',\n            type: 'timestamp',\n            default: 'CURRENT_TIMESTAMP',\n          },\n          {\n            name: 'updated_at',\n            type: 'timestamp',\n            default: 'CURRENT_TIMESTAMP',\n          },\n        ],\n      }),\n      true,\n    );\n\n    // Create indexes\n    await queryRunner.createIndex(\n      'users',\n      new Index({\n        name: 'IDX_USERS_EMAIL',\n        columnNames: ['email'],\n      }),\n    );\n\n    await queryRunner.createIndex(\n      'users',\n      new Index({\n        name: 'IDX_USERS_ROLE',\n        columnNames: ['role'],\n      }),\n    );\n\n    await queryRunner.createIndex(\n      'users',\n      new Index({\n        name: 'IDX_USERS_CREATED_AT',\n        columnNames: ['created_at'],\n      }),\n    );\n\n    // Add check constraint for role\n    await queryRunner.query(\n      `ALTER TABLE users ADD CONSTRAINT CHK_USERS_ROLE CHECK (role IN ('admin', 'user', 'moderator'))`,\n    );\n  }\n\n  public async down(queryRunner: QueryRunner): Promise<void> {\n    await queryRunner.dropTable('users');\n  }\n}"
    }
  ],
  "integrations": [
    {
      "service": "SendGrid",
      "purpose": "Email verification",
      "files": ["src/email/email.service.ts"]
    }
  ],
  "implementationNotes": {
    "security": [
      "Passwords hashed with bcrypt (10 rounds)",
      "Input validation using class-validator",
      "UUID for user IDs to prevent enumeration",
      "Soft delete to maintain audit trail"
    ],
    "performance": [
      "Database indexes on frequently queried columns",
      "Pagination for list endpoints",
      "Event-driven architecture for async operations"
    ],
    "errorHandling": [
      "Custom exceptions for business logic errors",
      "Global exception filter for consistent error responses",
      "Logging for all operations"
    ]
  },
  "dependencies": {
    "production": [
      "@nestjs/common",
      "@nestjs/core",
      "@nestjs/typeorm",
      "typeorm",
      "pg",
      "bcrypt",
      "class-validator",
      "class-transformer"
    ],
    "development": [
      "@types/node",
      "@types/bcrypt",
      "typescript"
    ]
  }
}
```

---

Let me continue this in another file to complete the full workflow chain.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create detailed data flow documentation", "status": "completed", "activeForm": "Creating detailed data flow documentation"}, {"content": "Create agent I/O interface definitions", "status": "in_progress", "activeForm": "Creating agent I/O interface definitions"}, {"content": "Create concrete workflow examples with actual data", "status": "pending", "activeForm": "Creating concrete workflow examples"}, {"content": "Create orchestrator implementation example", "status": "pending", "activeForm": "Creating orchestrator implementation example"}, {"content": "Create integration test examples", "status": "pending", "activeForm": "Creating integration test examples"}, {"content": "Update documentation with data flow details", "status": "pending", "activeForm": "Updating documentation"}]