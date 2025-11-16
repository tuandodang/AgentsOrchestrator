# Agent Configuration Guide

## Overview
This guide explains how to configure and customize agents in the SDLC Agent Orchestration System.

## Agent Configuration Structure

### Agent Definition
Each agent is defined in `config/agents.json` following the schema in `config/agent-schema.json`.

### Required Fields
```json
{
  "id": "unique-agent-id",
  "name": "Human Readable Name",
  "category": "architecture|frontend|backend|testing",
  "responsibilities": ["List", "of", "responsibilities"],
  "priority": "high|medium|low"
}
```

### Optional Fields
```json
{
  "phase": "SDLC Phase",
  "owner": "Team Member Name",
  "tools": ["AI Tool 1", "AI Tool 2"],
  "mcpServers": ["MCP Server Name"],
  "inputs": [/* input definitions */],
  "outputs": [/* output definitions */],
  "dependencies": ["agent-id-1", "agent-id-2"],
  "promptTemplate": "path/to/prompt.md",
  "configuration": {/* agent-specific config */},
  "notes": "Additional information"
}
```

## Configuring Inputs and Outputs

### Input Definition
```json
{
  "inputs": [
    {
      "name": "requirements",
      "type": "document",
      "required": true,
      "description": "Business and technical requirements"
    },
    {
      "name": "constraints",
      "type": "object",
      "required": false,
      "description": "Technical and business constraints"
    }
  ]
}
```

### Output Definition
```json
{
  "outputs": [
    {
      "name": "architectureDocument",
      "type": "markdown",
      "description": "Comprehensive architecture documentation"
    },
    {
      "name": "componentDiagrams",
      "type": "diagrams",
      "description": "System component diagrams"
    }
  ]
}
```

## Agent Dependencies

### Simple Dependency
An agent depends on another agent's output:
```json
{
  "id": "arch-003",
  "name": "Drawing Agent",
  "dependencies": ["arch-001"]
}
```

### Multiple Dependencies
```json
{
  "id": "be-001",
  "name": "Planning Agent",
  "dependencies": ["arch-001", "arch-002"]
}
```

### Dependency Resolution
The orchestrator resolves dependencies automatically:
1. Identifies agents with no dependencies (start nodes)
2. Executes agents when all dependencies are satisfied
3. Passes outputs from dependency agents as inputs

## Agent-Specific Configuration

### Example: UI Builder Agent
```json
{
  "id": "fe-001",
  "configuration": {
    "testFramework": "Jest",
    "styleApproach": "CSS-in-JS|SCSS|TailwindCSS",
    "accessibilityStandards": "WCAG 2.1"
  }
}
```

### Example: Implementation Agent
```json
{
  "id": "be-003",
  "configuration": {
    "architecturePattern": "clean-architecture|layered",
    "ormFramework": "TypeORM|Sequelize|SQLAlchemy",
    "validationLibrary": "Joi|Yup|class-validator"
  }
}
```

### Example: E2E Test Agent
```json
{
  "id": "test-003",
  "configuration": {
    "browsers": ["chromium", "firefox", "webkit"],
    "parallelization": true,
    "retryStrategy": "on-failure",
    "reportFormat": "html|json|junit"
  }
}
```

## Prompt Templates

### Location
Prompts are stored in the `prompts/` directory organized by category:
```
prompts/
├── architecture/
├── frontend/
├── backend/
└── testing/
```

### Referencing Prompts
```json
{
  "promptTemplate": "prompts/backend/implementation.md"
}
```

### Prompt Structure
```markdown
# Agent Name Prompt

## Role
[Agent's role description]

## Responsibilities
- [Responsibility 1]
- [Responsibility 2]

## Input Context
[What the agent receives]

## Expected Outputs
[What the agent should produce]

## Best Practices
[Guidelines and recommendations]

## Examples
[Code examples and templates]
```

## MCP Server Integration

### Configuring MCP Servers
```json
{
  "mcpServers": ["Azure DevOps MCP", "Figma MCP"]
}
```

### Available MCP Servers
- **Azure DevOps MCP**: Project management, work items, pipelines
- **Figma MCP**: Design file access, export assets
- **Lighthouse MCP**: Performance audits, accessibility checks
- **Playwright/Selenium MCP**: E2E test execution
- **Word MCP**: Document generation and editing

### MCP Server Capabilities
```json
{
  "mcpServers": [
    {
      "name": "Azure DevOps MCP",
      "capabilities": [
        "create_work_items",
        "update_work_items",
        "query_work_items",
        "trigger_pipeline"
      ]
    }
  ]
}
```

## Agent Priorities

### Priority Levels
- **High**: Critical path agents, must complete successfully
- **Medium**: Important but can be deferred
- **Low**: Nice-to-have, optional

### Priority Usage
```json
{
  "priority": "high",
  "notes": "Required for release. Cannot proceed without completion."
}
```

## Adding a New Agent

### Step 1: Define Agent
Create agent definition in `config/agents.json`:
```json
{
  "id": "custom-001",
  "name": "Custom Agent",
  "category": "backend",
  "phase": "Implementation",
  "owner": "Your Name",
  "responsibilities": [
    "Custom responsibility 1",
    "Custom responsibility 2"
  ],
  "priority": "medium",
  "tools": ["Claude AI"],
  "promptTemplate": "prompts/custom/custom-agent.md"
}
```

### Step 2: Create Prompt Template
Create `prompts/custom/custom-agent.md`:
```markdown
# Custom Agent Prompt

## Role
You are a Custom Agent specialized in...

## Responsibilities
- ...

[Rest of prompt template]
```

### Step 3: Define Inputs/Outputs
```json
{
  "inputs": [
    {
      "name": "inputName",
      "type": "inputType",
      "required": true,
      "description": "Input description"
    }
  ],
  "outputs": [
    {
      "name": "outputName",
      "type": "outputType",
      "description": "Output description"
    }
  ]
}
```

### Step 4: Test Agent
1. Validate configuration against schema
2. Test agent execution in isolation
3. Test agent in workflow context
4. Verify inputs/outputs work correctly

## Configuration Validation

### JSON Schema Validation
```bash
# Validate agents.json against schema
npm run validate-config
```

### Manual Validation Checklist
- [ ] Unique agent IDs
- [ ] Valid category values
- [ ] All dependencies exist
- [ ] Prompt templates exist
- [ ] Required fields present
- [ ] Input/output types valid
- [ ] MCP servers available

## Best Practices

### 1. Naming Conventions
- **Agent ID**: `category-number` (e.g., `be-001`, `fe-002`)
- **Agent Name**: Descriptive, clear purpose
- **Inputs/Outputs**: camelCase, descriptive

### 2. Dependencies
- Keep dependency chains short
- Avoid circular dependencies
- Document why dependencies exist

### 3. Configuration
- Use sensible defaults
- Make configuration overridable
- Document all options

### 4. Prompts
- Keep prompts focused
- Include examples
- Provide clear guidelines
- Update prompts as agents evolve

### 5. Documentation
- Document agent purpose
- Explain configuration options
- Provide usage examples
- Note any limitations

## Troubleshooting

### Agent Not Found
- Check agent ID spelling
- Verify agent exists in `agents.json`
- Ensure JSON is valid

### Dependency Issues
- Check dependency agent exists
- Verify dependency outputs match required inputs
- Check for circular dependencies

### MCP Server Not Available
- Verify MCP server is installed
- Check MCP server configuration
- Ensure required credentials are set

### Prompt Not Loading
- Verify prompt file path
- Check file exists
- Ensure markdown is valid

## Configuration Examples

See the `examples/` directory for complete agent configurations:
- `examples/custom-agent.json` - Template for new agents
- `examples/workflow-integration.json` - Agent in workflow
- `examples/advanced-config.json` - Advanced configurations
