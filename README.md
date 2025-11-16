# SDLC Agent Orchestration System

A comprehensive multi-agent system for orchestrating Software Development Life Cycle (SDLC) phases, from architecture design to testing.

## Overview

This system provides specialized AI agents for different phases of software development:

- **Architecture Design**: Technical documentation, requirement analysis, and diagram creation
- **Front-end Development**: UI building, code review, quality checks, and prototyping
- **Back-end Development**: Planning, API design, implementation, code review, and testing
- **Testing**: Test planning, test case generation, and end-to-end automation

## Project Structure

```
AgentsOrchestrator/
├── agents/                 # Agent definitions and implementations
│   ├── architecture/      # Architecture design agents
│   ├── frontend/          # Front-end development agents
│   ├── backend/           # Back-end development agents
│   └── testing/           # Testing agents
├── config/                # Configuration files
│   ├── agents.json       # Agent registry and configuration
│   └── workflows.json    # Workflow definitions
├── prompts/              # Agent prompts and instructions
│   ├── architecture/
│   ├── frontend/
│   ├── backend/
│   └── testing/
├── workflows/            # Workflow orchestration logic
├── docs/                 # Documentation
└── examples/             # Usage examples
```

## Agent Categories

### Architecture Design Agents

1. **Technical Documentation Agent** - System architecture and documentation
2. **Technical Requirement Analysis Agent** - Requirements analysis and WBS
3. **Drawing Agent** - Diagrams and visualizations

### Front-end Agents

1. **UI Builder Agent** - UI implementation from Figma
2. **FE Code Review Agent** - Front-end code quality and best practices
3. **Front-end Quality Check Agent** - SEO, accessibility, performance
4. **UI/UX Prototype Builder Agent** - Prototype creation

### Back-end Agents

1. **Planning Agent** - Requirements and sprint planning
2. **Design Note Agent** - API design and documentation
3. **Implementation Agent** - Business logic and integrations
4. **Code Review Agent** - Code quality and security
5. **Unit Test Agent** - Unit testing and coverage

### Testing Agents

1. **Test Plan/Strategy Generator** - Test planning and strategy
2. **Test Case Generator Agent** - Test case design
3. **End-to-End Test Agent** - E2E automation

## Quick Start

1. Configure agents in `config/agents.json`
2. Define workflows in `config/workflows.json`
3. Use agent prompts from `prompts/` directory
4. Execute workflows using the orchestrator

## MCP Integration

The system integrates with various Model Context Protocol (MCP) servers:

- **Azure DevOps MCP** - Project management integration
- **Figma MCP** - Design integration
- **Lighthouse MCP** - Performance testing
- **Playwright/Selenium MCP** - E2E testing

## Documentation

See the `docs/` directory for detailed documentation:

- [Agent Configuration Guide](docs/agent-configuration.md)
- [Workflow Design Guide](docs/workflow-design.md)
- [Prompt Engineering Guide](docs/prompt-engineering.md)
- [MCP Integration Guide](docs/mcp-integration.md)

## Contributing

This project is part of the SDLC automation initiative. Contributions welcome!

## License

MIT
