# Getting Started with SDLC Agent Orchestration System

## Introduction

The SDLC Agent Orchestration System is a comprehensive framework for managing AI agents throughout the software development lifecycle. It provides pre-configured agents for architecture design, front-end development, back-end development, and testing, along with flexible workflows to orchestrate them.

## Quick Start

### 1. Review Available Agents

Explore the agents defined in `config/agents.json`:

- **Architecture Design Agents** (3)
  - Technical Documentation Agent
  - Technical Requirement Analysis Agent
  - Drawing Agent

- **Front-end Agents** (4)
  - UI Builder Agent
  - FE Code Review Agent
  - Front-end Quality Check Agent
  - UI/UX Prototype Builder Agent

- **Back-end Agents** (5)
  - Planning Agent
  - Design Note Agent
  - Implementation Agent
  - Code Review Agent
  - Unit Test Agent

- **Testing Agents** (3)
  - Test Plan/Strategy Generator
  - Test Case Generator Agent
  - End-to-End Test Agent

### 2. Choose a Workflow

Select a pre-defined workflow from `config/workflows.json`:

- **Full SDLC Workflow** - Complete development lifecycle
- **Feature Development Workflow** - Add new feature
- **Bug Fix Workflow** - Investigate and fix bugs
- **UI/UX Development Workflow** - Front-end focused
- **API Development Workflow** - Back-end API focused

### 3. Understanding Agent Prompts

Each agent has a detailed prompt template in the `prompts/` directory:

```
prompts/
├── architecture/
│   ├── technical-documentation.md
│   ├── requirement-analysis.md
│   └── drawing-agent.md
├── frontend/
│   ├── ui-builder.md
│   ├── code-review.md
│   ├── quality-check.md
│   └── prototype-builder.md
├── backend/
│   ├── planning-agent.md
│   ├── design-note.md
│   ├── implementation.md
│   ├── code-review.md
│   └── unit-test.md
└── testing/
    ├── test-plan-generator.md
    ├── test-case-generator.md
    └── e2e-test.md
```

### 4. Use Agent Prompts

**Example: Creating API Documentation**

1. **Identify Agent**: Design Note Agent (`be-002`)
2. **Review Prompt**: Read `prompts/backend/design-note.md`
3. **Provide Inputs**:
   - Feature specification
   - Data model definitions
4. **Use Prompt**: Copy prompt to Claude AI/GitHub Copilot
5. **Get Outputs**:
   - OpenAPI specification
   - API design document
   - Request/response schemas

**Example: Implementing a Feature**

1. **Agent**: Implementation Agent (`be-003`)
2. **Prompt**: `prompts/backend/implementation.md`
3. **Inputs**: API spec, design document, programming language
4. **Tool**: GitHub Copilot or Cursor
5. **Outputs**: Source code, database migrations, integrations

## Common Use Cases

### Use Case 1: Starting a New Project

**Workflow**: Full SDLC Workflow

**Steps**:
1. **Requirements Analysis** (arch-002)
   - Input: Business requirements
   - Output: Requirements document, WBS
   - Prompt: `prompts/architecture/requirement-analysis.md`

2. **Architecture Design** (arch-001)
   - Input: Requirements document
   - Output: Architecture documentation
   - Prompt: `prompts/architecture/technical-documentation.md`

3. **Create Diagrams** (arch-003)
   - Input: Architecture documentation
   - Output: C4 diagrams, UML diagrams
   - Prompt: `prompts/architecture/drawing-agent.md`

4. **Plan Implementation** (be-001)
   - Input: Requirements, architecture
   - Output: Technical spec, tasks, sprint plan
   - Prompt: `prompts/backend/planning-agent.md`

5. **Design APIs** (be-002)
   - Input: Technical spec
   - Output: OpenAPI spec
   - Prompt: `prompts/backend/design-note.md`

6. **Implement** (be-003, fe-001)
   - Parallel: Back-end and front-end
   - Prompts: Implementation and UI builder

7. **Test** (be-005, test-003)
   - Unit tests and E2E tests
   - Prompts: Unit test and E2E test

### Use Case 2: Adding a Feature

**Workflow**: Feature Development Workflow

**Steps**:
1. Use Planning Agent to create technical spec
2. Use Design Note Agent for API design
3. Use Implementation Agent for code
4. Use Unit Test Agent for tests
5. Use Code Review Agent for review
6. Use E2E Test Agent for integration tests

### Use Case 3: Improving Front-end Quality

**Workflow**: UI/UX Development Workflow

**Steps**:
1. **Create Prototype** (fe-004)
   - Design interactive prototype
   - Establish design system

2. **Build UI** (fe-001)
   - Implement components from prototype
   - Write unit tests

3. **Review Code** (fe-002)
   - Check code quality
   - Verify best practices

4. **Quality Audit** (fe-003)
   - Run Lighthouse audits
   - Check SEO, accessibility, performance
   - Generate fixes

## Integration with AI Tools

### Claude AI
1. Copy agent prompt from `prompts/` directory
2. Provide your specific inputs
3. Paste into Claude conversation
4. Review and refine outputs

### GitHub Copilot / Cursor
1. Open prompt file in editor
2. Use prompt as context
3. Get AI-assisted code generation
4. Review and test code

### MCP Servers
Some agents integrate with MCP servers:
- **Azure DevOps MCP**: Project management
- **Figma MCP**: Design access
- **Lighthouse MCP**: Quality audits
- **Playwright MCP**: E2E testing

## Best Practices

### 1. Start with Planning
Always use Planning Agent before implementation to:
- Break down work
- Estimate effort
- Identify risks
- Define acceptance criteria

### 2. Follow the Workflow
Use predefined workflows as templates:
- Don't skip phases
- Respect dependencies
- Complete success criteria

### 3. Customize Prompts
Adapt agent prompts to your:
- Tech stack
- Team standards
- Project requirements
- Organization policies

### 4. Iterate and Improve
- Review agent outputs
- Refine prompts based on results
- Update configurations
- Share learnings with team

### 5. Quality Gates
Don't proceed without:
- Code review passing
- Tests passing
- Security scan clear
- Performance targets met

## Example: Complete Feature Flow

### Feature: User Password Reset

**Step 1: Planning** (10-15 min)
```
Agent: Planning Agent (be-001)
Input: "Add password reset feature with email verification"
Output:
- Technical spec
- 5 user stories
- 8 development tasks
- Estimated at 13 story points
```

**Step 2: API Design** (15-20 min)
```
Agent: Design Note Agent (be-002)
Input: Technical spec from step 1
Output:
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- OpenAPI spec with schemas
- Error response formats
```

**Step 3: Implementation** (2-3 hours)
```
Agent: Implementation Agent (be-003)
Input: API spec from step 2
Output:
- Controller endpoints
- Service layer logic
- Email integration
- Database models
```

**Step 4: Testing** (1 hour)
```
Agent: Unit Test Agent (be-005)
Input: Source code from step 3
Output:
- Unit tests (85% coverage)
- Mock email service
- Test fixtures
```

**Step 5: Code Review** (30 min)
```
Agent: Code Review Agent (be-004)
Input: Code changes
Output:
- Security review (OWASP check)
- Performance analysis
- Best practices validation
- 2 minor issues found and fixed
```

**Step 6: E2E Testing** (1 hour)
```
Agent: E2E Test Agent (test-003)
Input: Test scenarios
Output:
- Playwright test scripts
- Password reset flow tested
- Email verification tested
- All tests passing
```

**Total Time**: ~6 hours
**Quality**: High (tested, reviewed, documented)

## Troubleshooting

### Issue: Agent produces wrong output
**Solution**:
- Review prompt for clarity
- Provide more specific inputs
- Add examples to prompt
- Adjust agent configuration

### Issue: Dependencies not clear
**Solution**:
- Check `config/agents.json` dependencies
- Review workflow definition
- Ensure output types match input types

### Issue: Missing required input
**Solution**:
- Review agent input requirements
- Execute dependency agents first
- Provide input manually if needed

### Issue: MCP server not available
**Solution**:
- Install required MCP server
- Configure credentials
- Test connection
- Use fallback manual process

## Next Steps

1. **Explore Agents**: Read through agent prompts in `prompts/`
2. **Try a Workflow**: Start with Feature Development workflow
3. **Customize**: Adapt agents to your tech stack
4. **Integrate**: Connect with your AI tools (Claude, Copilot)
5. **Automate**: Build orchestration scripts for workflows
6. **Share**: Document your customizations and share with team

## Resources

- [Agent Configuration Guide](agent-configuration.md)
- [Workflow Design Guide](workflow-design.md)
- [Prompt Engineering Guide](prompt-engineering.md)
- [MCP Integration Guide](mcp-integration.md)

## Support

For questions or issues:
1. Check documentation in `docs/`
2. Review examples in `examples/`
3. Consult agent prompts in `prompts/`
4. Refer to configuration in `config/`

## Contributing

To add or modify agents:
1. Update `config/agents.json`
2. Create/update prompt in `prompts/`
3. Test agent independently
4. Test in workflow context
5. Update documentation
6. Submit changes

Happy orchestrating! 🚀
