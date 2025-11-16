# Agent Usage Examples

## Example 1: Architecture Documentation

### Scenario
You need to create comprehensive architecture documentation for a new e-commerce platform.

### Agent
Technical Documentation Agent (`arch-001`)

### Prompt
Use: `prompts/architecture/technical-documentation.md`

### Input
```
Project: E-commerce Platform
Requirements:
- Support 10,000 concurrent users
- Product catalog with search
- Shopping cart and checkout
- Payment integration (Stripe)
- Order management
- User authentication
- Admin dashboard

Tech Stack:
- Backend: Node.js, TypeScript, NestJS
- Frontend: React, Next.js
- Database: PostgreSQL
- Cache: Redis
- Message Queue: RabbitMQ
```

### Expected Output
- System Context Diagram (C4 Level 1)
- Container Diagram (C4 Level 2)
- Component Diagrams for key services
- Deployment Architecture
- Architecture Decision Records (ADRs)
- Technology stack documentation
- Security architecture
- Data architecture

## Example 2: API Design

### Scenario
Design RESTful API for user management microservice.

### Agent
Design Note Agent (`be-002`)

### Prompt
Use: `prompts/backend/design-note.md`

### Input
```
Feature: User Management Service

Requirements:
- CRUD operations for users
- User authentication
- Role-based access control
- Email verification
- Password reset
- User profile management
- Pagination and filtering

Data Model:
- User: id, email, password, firstName, lastName, role, isActive
- Role: admin, user, moderator
```

### Expected Output
```yaml
# OpenAPI Specification
paths:
  /api/v1/users:
    get:
      summary: List users
      parameters:
        - name: page
        - name: limit
        - name: role
    post:
      summary: Create user

  /api/v1/users/{id}:
    get:
      summary: Get user by ID
    put:
      summary: Update user
    delete:
      summary: Delete user

  /api/auth/login:
    post:
      summary: User login

  /api/auth/forgot-password:
    post:
      summary: Request password reset
```

## Example 3: React Component Implementation

### Scenario
Implement a ProductCard component from Figma design.

### Agent
UI Builder Agent (`fe-001`)

### Prompt
Use: `prompts/frontend/ui-builder.md`

### Input
```
Component: ProductCard
Framework: React + TypeScript
Styling: CSS Modules

Features:
- Product image with lazy loading
- Product title and description
- Price display
- "Add to Cart" button
- Wishlist toggle
- Rating stars
- Sale badge (if on sale)
- Responsive (mobile/desktop)

Interactions:
- Click card → Navigate to product detail
- Click "Add to Cart" → Add product to cart
- Click wishlist → Toggle wishlist state
- Hover → Elevate card with shadow
```

### Expected Output
```typescript
// ProductCard.tsx
interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  rating: number;
  onSale: boolean;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ ... }) => {
  // Implementation
};

// ProductCard.module.scss
// Styles

// ProductCard.test.tsx
// Unit tests
```

## Example 4: Code Review

### Scenario
Review a pull request for user authentication implementation.

### Agent
Code Review Agent (`be-004`)

### Prompt
Use: `prompts/backend/code-review.md`

### Input
```
Pull Request: #123 - Add JWT Authentication

Files Changed:
- src/auth/auth.service.ts
- src/auth/auth.controller.ts
- src/auth/jwt.strategy.ts
- src/users/users.service.ts

Changes:
- Implemented JWT token generation
- Added login endpoint
- Created JWT validation strategy
- Added password hashing with bcrypt
```

### Expected Output
```markdown
# Code Review Report

## Security Issues (Critical)
1. Password hash rounds too low (8, should be 10+)
2. JWT secret stored in code (should use env variable)
3. No rate limiting on login endpoint

## Best Practices (Medium)
1. Missing input validation on login DTO
2. Token expiration not configurable
3. No refresh token implementation

## Code Quality (Low)
1. Missing error logging
2. Magic numbers in code
3. Some functions too long

## Recommendations
- Implement rate limiting
- Add refresh token flow
- Extract magic numbers to constants
- Add comprehensive error logging
```

## Example 5: Test Plan

### Scenario
Create test plan for payment integration feature.

### Agent
Test Plan/Strategy Generator (`test-001`)

### Prompt
Use: `prompts/testing/test-plan-generator.md`

### Input
```
Feature: Payment Integration with Stripe

Scope:
- Process credit card payments
- Handle payment failures
- Process refunds
- Support multiple currencies
- Webhook handling for payment events

Requirements:
- PCI DSS compliance
- 99.9% uptime
- Response time < 2s
- Support 1000 transactions/hour
```

### Expected Output
```markdown
# Test Plan: Payment Integration

## Test Strategy
- Unit Testing: Service layer logic
- Integration Testing: Stripe API integration
- E2E Testing: Complete checkout flow
- Security Testing: PCI DSS compliance
- Performance Testing: Transaction throughput

## Test Scenarios
1. Successful payment
2. Declined card
3. Insufficient funds
4. Invalid card details
5. Network timeout
6. Webhook processing
7. Refund processing
8. Currency conversion

## Success Criteria
- All payments processed correctly
- All errors handled gracefully
- Security scan passed
- Performance targets met
- Test coverage > 80%
```

## Example 6: E2E Testing

### Scenario
Create automated E2E tests for user registration flow.

### Agent
End-to-End Test Agent (`test-003`)

### Prompt
Use: `prompts/testing/e2e-test.md`

### Input
```
Feature: User Registration

Test Scenarios:
1. Successful registration
2. Duplicate email validation
3. Password strength validation
4. Email verification flow
5. Form validation errors
6. Success redirect

Framework: Playwright
Browsers: Chrome, Firefox, Safari
```

### Expected Output
```typescript
// tests/auth/registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="email"]', `test+${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/verify-email');
    await expect(page.locator('h1')).toContainText('Verify Your Email');
  });

  test('should reject duplicate email', async ({ page }) => {
    // Test implementation
  });

  test('should validate password strength', async ({ page }) => {
    // Test implementation
  });
});
```

## Example 7: Quality Audit

### Scenario
Run quality audit on production website and get fixes.

### Agent
Front-end Quality Check Agent (`fe-003`)

### Prompt
Use: `prompts/frontend/quality-check.md`

### Input
```
URL: https://example.com
Audit Types:
- Performance
- Accessibility
- SEO
- Best Practices

Target Scores:
- Performance: 90+
- Accessibility: 95+
- SEO: 90+
```

### Expected Output
```markdown
# Quality Audit Report

## Scores
- Performance: 78 ⚠️
- Accessibility: 92 ✅
- SEO: 85 ⚠️
- Best Practices: 95 ✅

## Critical Issues

### Performance (LCP: 3.2s)
**Issue**: Hero image not optimized (2.1MB)

**Fix**:
```typescript
// Replace:
<img src="/hero.jpg" />

// With:
import Image from 'next/image';
<Image src="/hero.jpg" priority placeholder="blur" />
```

### Accessibility (Missing Labels)
**Issue**: Form inputs missing labels

**Fix**:
```html
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />
```
```

## Example 8: Unit Testing

### Scenario
Write unit tests for UserService class.

### Agent
Unit Test Agent (`be-005`)

### Prompt
Use: `prompts/backend/unit-test.md`

### Input
```
Source Code: UserService
Methods:
- create(userData): Create new user
- findById(id): Get user by ID
- update(id, data): Update user
- delete(id): Delete user
- findByEmail(email): Find user by email

Framework: Jest
Language: TypeScript
```

### Expected Output
```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let repository: MockRepository<User>;

  beforeEach(() => {
    // Setup
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      // Test implementation
    });

    it('should throw ConflictException for duplicate email', async () => {
      // Test implementation
    });

    it('should hash password before saving', async () => {
      // Test implementation
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      // Test implementation
    });

    it('should throw NotFoundException when not found', async () => {
      // Test implementation
    });
  });

  // More tests...
});
```

## Example 9: Full Feature Implementation

### Scenario
Implement complete "User Profile Update" feature.

### Workflow
Feature Development Workflow

### Steps

**1. Planning** (be-001)
```
Input: "Add user profile update feature"
Output: Technical spec, 8 tasks, 5 story points
```

**2. API Design** (be-002)
```
Input: Technical spec
Output:
PUT /api/v1/users/{id}
PATCH /api/v1/users/{id}/avatar
```

**3. Backend Implementation** (be-003)
```
Input: API spec
Output:
- UserController.update()
- UserService.updateProfile()
- Validation logic
- File upload for avatar
```

**4. Frontend Implementation** (fe-001)
```
Input: API spec, design
Output:
- ProfileEditForm component
- Avatar upload component
- Form validation
- API integration
```

**5. Testing** (be-005, test-003)
```
Backend: Unit tests (90% coverage)
Frontend: E2E tests (profile update flow)
```

**6. Review** (be-004, fe-002)
```
Backend: Security check, best practices
Frontend: Accessibility, performance
```

**7. Quality Check** (fe-003)
```
Lighthouse audit: All scores > 90
```

## Quick Reference

### When to Use Which Agent

| Task | Agent | Prompt |
|------|-------|--------|
| Analyze requirements | arch-002 | requirement-analysis.md |
| Design architecture | arch-001 | technical-documentation.md |
| Create diagrams | arch-003 | drawing-agent.md |
| Plan development | be-001 | planning-agent.md |
| Design APIs | be-002 | design-note.md |
| Implement backend | be-003 | implementation.md |
| Implement UI | fe-001 | ui-builder.md |
| Review code | be-004, fe-002 | code-review.md |
| Write unit tests | be-005 | unit-test.md |
| Create test plan | test-001 | test-plan-generator.md |
| Write test cases | test-002 | test-case-generator.md |
| Create E2E tests | test-003 | e2e-test.md |
| Audit quality | fe-003 | quality-check.md |
| Design prototype | fe-004 | prototype-builder.md |

## Tips for Success

1. **Be Specific**: Provide detailed inputs to agents
2. **Follow Sequence**: Respect agent dependencies
3. **Iterate**: Refine outputs, don't expect perfection first time
4. **Customize**: Adapt prompts to your context
5. **Validate**: Always review agent outputs
6. **Document**: Keep track of what works well
