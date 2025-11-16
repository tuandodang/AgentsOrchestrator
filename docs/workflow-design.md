# Workflow Design Guide

## Overview
This guide explains how to design and implement workflows for orchestrating multiple agents in the SDLC process.

## Workflow Structure

### Basic Workflow Definition
```json
{
  "id": "wf-001",
  "name": "Workflow Name",
  "description": "Workflow description",
  "phases": [
    {
      "name": "Phase Name",
      "sequence": 1,
      "agents": [/* agent configurations */]
    }
  ],
  "successCriteria": [/* criteria list */]
}
```

## Workflow Phases

### Phase Definition
```json
{
  "name": "Implementation",
  "sequence": 3,
  "agents": [
    {
      "agentId": "be-003",
      "name": "Implementation Agent",
      "inputs": ["api_spec", "design_document"],
      "outputs": ["source_code"],
      "parallel": true,
      "dependsOn": []
    }
  ]
}
```

### Phase Sequencing
Phases execute in order defined by `sequence` number:
- Lower numbers execute first
- Same sequence numbers execute in parallel (if possible)
- Each phase completes before next begins

## Agent Execution Patterns

### Sequential Execution
Agents run one after another:
```json
{
  "agents": [
    {
      "agentId": "arch-002",
      "parallel": false
    },
    {
      "agentId": "arch-001",
      "parallel": false,
      "dependsOn": ["arch-002"]
    }
  ]
}
```

### Parallel Execution
Independent agents run simultaneously:
```json
{
  "agents": [
    {
      "agentId": "be-001",
      "parallel": true
    },
    {
      "agentId": "fe-004",
      "parallel": true
    },
    {
      "agentId": "test-001",
      "parallel": true
    }
  ]
}
```

### Mixed Execution
Combination of sequential and parallel:
```json
{
  "agents": [
    {
      "agentId": "be-001",
      "parallel": false
    },
    {
      "agentId": "be-002",
      "parallel": false,
      "dependsOn": ["be-001"]
    },
    {
      "agentId": "be-003",
      "parallel": true,
      "dependsOn": ["be-002"]
    },
    {
      "agentId": "fe-001",
      "parallel": true,
      "dependsOn": ["be-002"]
    }
  ]
}
```

## Agent Communication Patterns

### 1. Synchronous Pattern
**Description**: Agent A waits for Agent B to complete before starting.

**Use Case**: When outputs from one agent are required inputs for another.

**Example**:
```
Planning Agent → Design Note Agent → Implementation Agent
```

**Implementation**:
```json
{
  "agents": [
    {
      "agentId": "be-001",
      "outputs": ["technical_spec"]
    },
    {
      "agentId": "be-002",
      "inputs": ["technical_spec"],
      "dependsOn": ["be-001"]
    }
  ]
}
```

### 2. Asynchronous Pattern
**Description**: Multiple agents work independently in parallel.

**Use Case**: When agents have no dependencies and work on different aspects.

**Example**:
```
Back-end Dev || Front-end Dev || Test Planning
```

**Implementation**:
```json
{
  "agents": [
    {"agentId": "be-003", "parallel": true},
    {"agentId": "fe-001", "parallel": true},
    {"agentId": "test-001", "parallel": true}
  ]
}
```

### 3. Fan-Out Pattern
**Description**: One agent's output feeds multiple downstream agents.

**Use Case**: When multiple teams need same artifact.

**Example**:
```
Requirements Agent → BE Planning | FE Design | Test Planning
```

**Implementation**:
```json
{
  "agents": [
    {
      "agentId": "arch-002",
      "outputs": ["requirements_doc"]
    },
    {
      "agentId": "be-001",
      "inputs": ["requirements_doc"],
      "parallel": true,
      "dependsOn": ["arch-002"]
    },
    {
      "agentId": "fe-004",
      "inputs": ["requirements_doc"],
      "parallel": true,
      "dependsOn": ["arch-002"]
    },
    {
      "agentId": "test-001",
      "inputs": ["requirements_doc"],
      "parallel": true,
      "dependsOn": ["arch-002"]
    }
  ]
}
```

### 4. Fan-In Pattern
**Description**: Multiple agents' outputs converge to single agent.

**Use Case**: When integration or review requires all components.

**Example**:
```
BE Implementation → Integration Test ← FE Implementation
```

**Implementation**:
```json
{
  "agents": [
    {
      "agentId": "be-003",
      "outputs": ["backend_code"],
      "parallel": true
    },
    {
      "agentId": "fe-001",
      "outputs": ["frontend_code"],
      "parallel": true
    },
    {
      "agentId": "test-003",
      "inputs": ["backend_code", "frontend_code"],
      "dependsOn": ["be-003", "fe-001"]
    }
  ]
}
```

### 5. Pipeline Pattern
**Description**: Linear sequence of agents, each building on previous.

**Use Case**: Traditional waterfall or staged processes.

**Example**:
```
Requirements → Architecture → Design → Implementation → Testing
```

**Implementation**:
```json
{
  "phases": [
    {"sequence": 1, "agents": [{"agentId": "arch-002"}]},
    {"sequence": 2, "agents": [{"agentId": "arch-001"}]},
    {"sequence": 3, "agents": [{"agentId": "be-002"}]},
    {"sequence": 4, "agents": [{"agentId": "be-003"}]},
    {"sequence": 5, "agents": [{"agentId": "test-003"}]}
  ]
}
```

## Data Flow Design

### Artifact Passing
```json
{
  "artifacts": [
    {
      "name": "api_spec",
      "type": "openapi",
      "producedBy": ["be-002"],
      "consumedBy": ["be-003", "test-003"]
    }
  ]
}
```

### Data Transformation
```json
{
  "transformations": [
    {
      "from": "requirements_doc",
      "to": "technical_spec",
      "transformedBy": "be-001"
    }
  ]
}
```

## Success Criteria

### Workflow-Level Criteria
```json
{
  "successCriteria": [
    "All requirements traced to implementation",
    "Code review passed",
    "Test coverage > 80%",
    "All tests passing",
    "Performance benchmarks met",
    "Security vulnerabilities addressed"
  ]
}
```

### Phase-Level Criteria
```json
{
  "name": "Implementation",
  "successCriteria": [
    "All APIs implemented",
    "Unit tests written",
    "Code compiles without errors"
  ]
}
```

### Agent-Level Criteria
```json
{
  "agentId": "be-003",
  "successCriteria": [
    "Code follows style guide",
    "No critical security issues",
    "All functions have tests"
  ]
}
```

## Error Handling

### Retry Strategies
```json
{
  "errorHandling": {
    "retryAttempts": 3,
    "retryDelay": "exponential",
    "failureBehavior": "halt|continue|skip"
  }
}
```

### Fallback Agents
```json
{
  "agentId": "be-003",
  "fallbackAgentId": "be-003-backup",
  "fallbackConditions": ["timeout", "error"]
}
```

## Workflow Examples

### Example 1: Feature Development
```json
{
  "id": "wf-feature-dev",
  "name": "Feature Development",
  "phases": [
    {
      "name": "Planning",
      "sequence": 1,
      "agents": [
        {"agentId": "be-001"},
        {"agentId": "be-002", "dependsOn": ["be-001"]}
      ]
    },
    {
      "name": "Development",
      "sequence": 2,
      "agents": [
        {"agentId": "be-003", "parallel": true},
        {"agentId": "fe-001", "parallel": true}
      ]
    },
    {
      "name": "Quality Assurance",
      "sequence": 3,
      "agents": [
        {"agentId": "be-004", "parallel": true},
        {"agentId": "fe-002", "parallel": true},
        {"agentId": "test-003"}
      ]
    }
  ]
}
```

### Example 2: Bug Fix Workflow
```json
{
  "id": "wf-bug-fix",
  "name": "Bug Fix Workflow",
  "phases": [
    {
      "name": "Investigation",
      "agents": [{"agentId": "be-004"}]
    },
    {
      "name": "Fix",
      "agents": [
        {"agentId": "be-003"},
        {"agentId": "be-005", "dependsOn": ["be-003"]}
      ]
    },
    {
      "name": "Verification",
      "agents": [{"agentId": "test-003"}]
    }
  ]
}
```

## Workflow Optimization

### Parallelization
Identify independent tasks and run in parallel:
```
Before:  A → B → C → D → E  (5 time units)
After:   A → B → (C || D) → E  (4 time units)
```

### Resource Allocation
```json
{
  "resourceLimits": {
    "maxParallelAgents": 5,
    "maxMemory": "4GB",
    "timeout": "30m"
  }
}
```

### Caching
```json
{
  "caching": {
    "enabled": true,
    "artifacts": ["api_spec", "diagrams"],
    "ttl": "24h"
  }
}
```

## Monitoring and Observability

### Workflow Metrics
```json
{
  "metrics": [
    "totalDuration",
    "agentSuccessRate",
    "averagePhaseTime",
    "errorRate",
    "resourceUtilization"
  ]
}
```

### Logging
```json
{
  "logging": {
    "level": "info",
    "includeTimestamps": true,
    "includeAgentOutputs": false,
    "destination": "console|file|cloud"
  }
}
```

## Best Practices

### 1. Design for Failure
- Assume agents can fail
- Implement retry logic
- Have fallback strategies
- Graceful degradation

### 2. Optimize Critical Path
- Identify longest sequential chain
- Parallelize where possible
- Optimize slowest agents

### 3. Clear Dependencies
- Document why dependencies exist
- Minimize coupling
- Use well-defined interfaces

### 4. Testability
- Unit test individual agents
- Integration test workflows
- Have test/staging environments

### 5. Versioning
- Version workflow definitions
- Track changes over time
- Maintain backward compatibility

### 6. Documentation
- Document workflow purpose
- Explain agent sequencing
- Note success criteria

## Workflow Validation

### Pre-execution Checks
- [ ] All agents exist
- [ ] Dependencies are valid
- [ ] No circular dependencies
- [ ] Required inputs available
- [ ] Success criteria defined

### Post-execution Validation
- [ ] All phases completed
- [ ] Success criteria met
- [ ] Outputs produced
- [ ] No errors or failures

## Workflow Templates

### Template: Full SDLC
Use for: Complete project implementation
Duration: 4-8 weeks
Agents: 10+

### Template: Feature Development
Use for: New feature addition
Duration: 1-2 weeks
Agents: 5-7

### Template: Bug Fix
Use for: Production issue resolution
Duration: 1-3 days
Agents: 3-4

### Template: Code Review
Use for: PR review process
Duration: Hours
Agents: 1-2

## Advanced Patterns

### Conditional Execution
```json
{
  "agentId": "test-003",
  "executeIf": {
    "condition": "env == 'production'",
    "otherwise": "skip"
  }
}
```

### Dynamic Agent Selection
```json
{
  "agentSelection": {
    "strategy": "load-balanced|round-robin|priority",
    "pool": ["be-003-1", "be-003-2", "be-003-3"]
  }
}
```

### Feedback Loops
```json
{
  "feedbackLoop": {
    "maxIterations": 3,
    "exitCondition": "allTestsPassing",
    "agents": ["be-003", "test-003", "be-004"]
  }
}
```
