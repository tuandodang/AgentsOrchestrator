# AI Tool Integration Guide

This guide explains how to integrate AI tools (Claude AI, GitHub Copilot, ChatGPT, etc.) into the SDLC Agent Orchestration System.

## Integration Approaches

### 1. Manual Integration (Copy-Paste)
### 2. API-Based Integration (Programmatic)
### 3. IDE-Based Integration (Copilot/Cursor)
### 4. LangChain/LangGraph Integration (Advanced)
### 5. MCP Server Integration

---

## Approach 1: Manual Integration (Quickest Start)

### Overview
Copy agent prompts and manually interact with AI tools through their web interfaces.

### Steps

#### Step 1: Choose Your Workflow
```bash
# View available workflows
cat config/workflows.json
```

#### Step 2: Start with First Agent
```bash
# Example: Feature Development Workflow starts with Planning Agent
cat prompts/backend/planning-agent.md
```

#### Step 3: Prepare Input Context
```json
{
  "feature": "User Password Reset",
  "requirements": [
    "Users can request password reset via email",
    "Reset link expires after 1 hour",
    "Users set new password"
  ]
}
```

#### Step 4: Use AI Tool

**With Claude AI (Web):**
1. Go to https://claude.ai
2. Start new conversation
3. Copy the entire prompt from `prompts/backend/planning-agent.md`
4. Add your input context:
   ```
   [PASTE PROMPT]

   Input:
   {
     "feature": "User Password Reset",
     "requirements": [...]
   }
   ```
5. Claude generates the output (technical spec, sprint plan, tasks)

**With ChatGPT:**
1. Go to https://chat.openai.com
2. Copy prompt + input
3. Get output

**With GitHub Copilot Chat:**
1. Open VS Code
2. Press `Cmd+I` (Inline Chat) or open Copilot Chat panel
3. Paste prompt + input
4. Get output in your IDE

#### Step 5: Save Output as Next Agent's Input
```bash
# Save Claude's output to a file
mkdir -p output
cat > output/technical-spec.json << 'EOF'
{
  "documentId": "SPEC-001",
  "apiEndpoints": [...],
  "tasks": [...]
}
EOF
```

#### Step 6: Move to Next Agent
```bash
# Next agent: Design Note Agent
cat prompts/backend/design-note.md

# Use the technical-spec.json as input
```

### Pros & Cons

✅ **Pros:**
- No coding required
- Works immediately
- Good for learning the system
- Can use any AI tool

❌ **Cons:**
- Manual copy-paste between agents
- No automation
- Easy to lose intermediate outputs
- Time-consuming for multiple iterations

### Example Workflow

```bash
# 1. Planning Agent
claude.ai → paste prompts/backend/planning-agent.md + input
→ save output to output/technical-spec.json

# 2. Design Note Agent
claude.ai → paste prompts/backend/design-note.md + technical-spec.json
→ save output to output/api-spec.yaml

# 3. Implementation Agent
copilot → paste prompts/backend/implementation.md + api-spec.yaml
→ generates code directly in IDE

# 4. Unit Test Agent
copilot → paste prompts/backend/unit-test.md + source code
→ generates tests in IDE

# 5. Code Review Agent
claude.ai → paste prompts/backend/code-review.md + git diff
→ get review report

# 6. E2E Test Agent
copilot → paste prompts/testing/e2e-test.md + API spec
→ generates Playwright tests
```

---

## Approach 2: API-Based Integration (Recommended for Production)

### Overview
Programmatically call AI APIs to automate the entire workflow.

### Supported APIs
- **Anthropic Claude API**
- **OpenAI GPT-4 API**
- **Google Gemini API**
- **Azure OpenAI Service**
- **AWS Bedrock**

### Implementation

#### Install Dependencies
```bash
npm install @anthropic-ai/sdk openai dotenv
```

#### Environment Configuration
```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
MODEL_PROVIDER=anthropic  # or openai, azure, etc.
DEFAULT_MODEL=claude-3-5-sonnet-20241022
```

#### AI Agent Client
```typescript
// src/ai/ai-client.ts
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import * as fs from 'fs/promises';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AIClient {
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private provider: string;
  private model: string;

  constructor() {
    this.provider = process.env.MODEL_PROVIDER || 'anthropic';
    this.model = process.env.DEFAULT_MODEL || 'claude-3-5-sonnet-20241022';

    if (this.provider === 'anthropic') {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    } else if (this.provider === 'openai') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async generateResponse(
    prompt: string,
    context: Record<string, any>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    const userMessage = this.formatPromptWithContext(prompt, context);

    if (this.provider === 'anthropic') {
      return await this.callClaude(userMessage, options);
    } else if (this.provider === 'openai') {
      return await this.callOpenAI(userMessage, options);
    }

    throw new Error(`Unsupported provider: ${this.provider}`);
  }

  private async callClaude(
    message: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    const response = await this.anthropic!.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 0.7,
      system: options?.systemPrompt || 'You are a helpful AI assistant specialized in software development.',
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    return response.content[0].type === 'text'
      ? response.content[0].text
      : '';
  }

  private async callOpenAI(
    message: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    const response = await this.openai!.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: options?.systemPrompt || 'You are a helpful AI assistant.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 4096,
    });

    return response.choices[0].message.content || '';
  }

  private formatPromptWithContext(
    prompt: string,
    context: Record<string, any>
  ): string {
    // Format the prompt with context
    let formatted = prompt;

    formatted += '\n\n## Input Context\n\n';
    formatted += '```json\n';
    formatted += JSON.stringify(context, null, 2);
    formatted += '\n```\n\n';

    formatted += 'Please generate the output according to the specifications above.';

    return formatted;
  }

  async loadPromptTemplate(templatePath: string): Promise<string> {
    return await fs.readFile(templatePath, 'utf-8');
  }
}
```

#### Enhanced Orchestrator with AI Integration

```typescript
// workflows/ai-orchestrator.ts
import { AIClient } from '../src/ai/ai-client';
import * as fs from 'fs/promises';
import * as path from 'path';

export class AIAgentOrchestrator {
  private aiClient: AIClient;
  private artifacts: Map<string, any>;
  private agentsConfig: Map<string, any>;

  constructor() {
    this.aiClient = new AIClient();
    this.artifacts = new Map();
    this.agentsConfig = new Map();
  }

  async loadAgentConfigurations(configPath: string): Promise<void> {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    for (const agent of config.agents) {
      this.agentsConfig.set(agent.id, agent);
    }

    console.log(`✅ Loaded ${this.agentsConfig.size} agent configurations`);
  }

  async executeAgent(
    agentId: string,
    inputs: Record<string, any>
  ): Promise<Record<string, any>> {
    console.log(`\n🤖 Executing agent: ${agentId}`);

    // Get agent configuration
    const agentConfig = this.agentsConfig.get(agentId);
    if (!agentConfig) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Load prompt template
    const promptPath = path.join(__dirname, '..', agentConfig.promptTemplate);
    const prompt = await this.aiClient.loadPromptTemplate(promptPath);

    // Call AI with prompt and inputs
    console.log(`   📤 Sending to AI (${process.env.MODEL_PROVIDER})...`);
    const response = await this.aiClient.generateResponse(prompt, inputs, {
      systemPrompt: `You are ${agentConfig.name}. ${agentConfig.responsibilities.join('. ')}.`,
      temperature: 0.7,
      maxTokens: 4096,
    });

    console.log(`   ✅ Received response (${response.length} chars)`);

    // Parse AI response
    const outputs = this.parseAIResponse(response, agentConfig);

    // Store outputs as artifacts
    for (const [key, value] of Object.entries(outputs)) {
      this.artifacts.set(key, value);
    }

    return outputs;
  }

  private parseAIResponse(
    response: string,
    agentConfig: any
  ): Record<string, any> {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.warn('Failed to parse JSON from code block, trying full response');
      }
    }

    // Try parsing entire response
    try {
      return JSON.parse(response);
    } catch (e) {
      // If not JSON, return as structured object based on agent outputs
      const outputs: Record<string, any> = {};

      for (const output of agentConfig.outputs) {
        outputs[output.name] = {
          content: response,
          metadata: {
            agentId: agentConfig.id,
            generatedAt: new Date().toISOString(),
          },
        };
      }

      return outputs;
    }
  }

  async executeWorkflow(
    workflowId: string,
    initialInputs: Record<string, any>
  ): Promise<Map<string, any>> {
    console.log(`\n🚀 Starting AI-powered workflow: ${workflowId}`);

    // Load workflow definition
    const workflowPath = path.join(__dirname, '../config/workflows.json');
    const workflowContent = await fs.readFile(workflowPath, 'utf-8');
    const workflows = JSON.parse(workflowContent);
    const workflow = workflows.workflows.find((w: any) => w.id === workflowId);

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Store initial inputs
    for (const [key, value] of Object.entries(initialInputs)) {
      this.artifacts.set(key, value);
    }

    // Execute each phase
    for (const phase of workflow.phases) {
      console.log(`\n📍 Phase ${phase.sequence}: ${phase.name}`);

      for (const agentConfig of phase.agents) {
        // Prepare inputs from artifacts
        const inputs: Record<string, any> = {};

        // Collect inputs based on agent dependencies
        if (agentConfig.dependsOn && agentConfig.dependsOn.length > 0) {
          for (const depAgentId of agentConfig.dependsOn) {
            const depAgent = this.agentsConfig.get(depAgentId);
            if (depAgent) {
              for (const output of depAgent.outputs) {
                const artifact = this.artifacts.get(output.name);
                if (artifact) {
                  inputs[output.name] = artifact;
                }
              }
            }
          }
        }

        // Add specified inputs
        if (agentConfig.inputs) {
          for (const inputName of agentConfig.inputs) {
            const artifact = this.artifacts.get(inputName);
            if (artifact) {
              inputs[inputName] = artifact;
            }
          }
        }

        // Execute agent with AI
        await this.executeAgent(agentConfig.agentId, inputs);
      }
    }

    console.log(`\n✅ Workflow completed successfully`);
    return this.artifacts;
  }

  async exportArtifacts(outputPath: string): Promise<void> {
    const artifactsObj: Record<string, any> = {};

    for (const [key, value] of this.artifacts.entries()) {
      artifactsObj[key] = value;
    }

    await fs.writeFile(
      outputPath,
      JSON.stringify(artifactsObj, null, 2)
    );

    console.log(`\n💾 Artifacts exported to: ${outputPath}`);
  }
}
```

#### Usage Example

```typescript
// examples/run-workflow-with-ai.ts
import { AIAgentOrchestrator } from '../workflows/ai-orchestrator';
import * as path from 'path';

async function main() {
  const orchestrator = new AIAgentOrchestrator();

  // Load agent configurations
  await orchestrator.loadAgentConfigurations(
    path.join(__dirname, '../config/agents.json')
  );

  // Execute workflow with AI
  const artifacts = await orchestrator.executeWorkflow('wf-002', {
    businessRequirements: {
      feature: 'User Password Reset',
      description: 'Users should be able to reset their password via email',
      requirements: [
        'User can request password reset',
        'System sends email with reset link',
        'Reset link expires after 1 hour',
        'User sets new password',
      ],
    },
  });

  // Export all artifacts
  await orchestrator.exportArtifacts(
    path.join(__dirname, '../output/workflow-artifacts.json')
  );

  console.log('\n✅ Complete! Artifacts generated:');
  for (const [key] of artifacts.entries()) {
    console.log(`   - ${key}`);
  }
}

main().catch(console.error);
```

#### Running the Workflow

```bash
# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Install dependencies
npm install

# Run the workflow
npm run workflow:execute

# Output:
# 🚀 Starting AI-powered workflow: wf-002
#
# 📍 Phase 1: Planning
#    🤖 Executing agent: be-001
#    📤 Sending to AI (anthropic)...
#    ✅ Received response (3542 chars)
#
# 📍 Phase 2: Development
#    🤖 Executing agent: be-002
#    📤 Sending to AI (anthropic)...
#    ✅ Received response (5234 chars)
#
# ... continues for all agents ...
#
# ✅ Workflow completed successfully
# 💾 Artifacts exported to: output/workflow-artifacts.json
```

### Configuration Examples

#### Multi-Provider Setup

```typescript
// config/ai-config.ts
export const aiConfig = {
  providers: {
    anthropic: {
      models: {
        'claude-3-5-sonnet-20241022': {
          maxTokens: 8192,
          costPer1kTokens: { input: 0.003, output: 0.015 },
        },
        'claude-3-opus-20240229': {
          maxTokens: 4096,
          costPer1kTokens: { input: 0.015, output: 0.075 },
        },
      },
    },
    openai: {
      models: {
        'gpt-4-turbo': {
          maxTokens: 4096,
          costPer1kTokens: { input: 0.01, output: 0.03 },
        },
        'gpt-3.5-turbo': {
          maxTokens: 4096,
          costPer1kTokens: { input: 0.0005, output: 0.0015 },
        },
      },
    },
  },

  // Agent-specific model selection
  agentModels: {
    'arch-001': 'claude-3-opus-20240229',      // Complex architecture needs Opus
    'arch-002': 'claude-3-5-sonnet-20241022',  // Requirements analysis
    'be-001': 'claude-3-5-sonnet-20241022',    // Planning
    'be-002': 'claude-3-5-sonnet-20241022',    // API design
    'be-003': 'gpt-4-turbo',                   // Implementation (good at code)
    'be-004': 'claude-3-5-sonnet-20241022',    // Code review
    'be-005': 'gpt-4-turbo',                   // Unit tests (good at code)
    'test-003': 'gpt-4-turbo',                 // E2E tests
  },
};
```

---

## Approach 3: IDE-Based Integration

### GitHub Copilot / Cursor Integration

#### Setup in VS Code

1. **Install Extensions**
   - GitHub Copilot
   - GitHub Copilot Chat

2. **Create Workspace Settings**

```json
// .vscode/settings.json
{
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "markdown": true,
    "typescript": true
  },
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "text": "Follow clean architecture principles"
    },
    {
      "text": "Write TypeScript with strict types"
    },
    {
      "text": "Include comprehensive error handling"
    },
    {
      "text": "Add JSDoc comments for public APIs"
    }
  ]
}
```

3. **Create Agent Snippets**

```json
// .vscode/agents.code-snippets
{
  "Load Planning Agent": {
    "prefix": "agent-planning",
    "body": [
      "// Planning Agent",
      "// Prompt: ${1:prompts/backend/planning-agent.md}",
      "",
      "const input = {",
      "  requirements: $2",
      "};",
      "",
      "// @copilot Use the planning agent prompt to generate:",
      "// 1. Technical specification",
      "// 2. Sprint plan with tasks",
      "// 3. Risk analysis",
      ""
    ]
  },

  "Load Implementation Agent": {
    "prefix": "agent-implementation",
    "body": [
      "// Implementation Agent",
      "// Prompt: ${1:prompts/backend/implementation.md}",
      "",
      "// @copilot Implement the following based on API spec:",
      "// API Spec: $2",
      ""
    ]
  }
}
```

4. **Use Copilot Chat with Agent Prompts**

```typescript
// In VS Code, open Copilot Chat and use:

// Step 1: Load prompt context
//@workspace /file:prompts/backend/planning-agent.md

// Step 2: Provide input
Given these requirements: { feature: "Password Reset", ... }
Generate a technical specification following the prompt template.

// Step 3: Copilot generates output
// Step 4: Save output, move to next agent
```

### Cursor Integration

#### Cursor AI Rules

```markdown
<!-- .cursorrules -->
# Agent Orchestration Rules

## When implementing agents:
1. Always reference the agent prompt from prompts/ directory
2. Include metadata (documentId, basedOn, createdAt)
3. Follow the output schema defined in config/agents.json
4. Maintain traceability with basedOn fields

## Code Generation:
- Use TypeScript with strict types
- Follow NestJS patterns for backend
- Use React + TypeScript for frontend
- Include comprehensive error handling
- Add unit tests with >80% coverage

## Agent-Specific Rules:

### Planning Agent (be-001)
- Output must include: technical_spec, sprint_plan, tasks
- Base estimates on team velocity
- Include risk analysis

### Implementation Agent (be-003)
- Generate production-ready code
- Include input validation
- Add comprehensive error handling
- Follow clean architecture

### Unit Test Agent (be-005)
- Use Jest/Testing Library
- AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Achieve >80% coverage
```

#### Usage in Cursor

```
1. Open Cursor IDE
2. Load agent prompt: Cmd+K → reference prompts/backend/implementation.md
3. Provide context from previous agent
4. Cursor generates code following .cursorrules
5. Code appears directly in your files
```

---

## Approach 4: LangChain/LangGraph Integration (Advanced)

### Why LangChain?
- Advanced orchestration capabilities
- Built-in memory and state management
- Support for multiple AI providers
- Agent communication patterns
- Streaming and async support

### Installation

```bash
npm install langchain @langchain/anthropic @langchain/openai
```

### LangChain Implementation

```typescript
// src/langchain/agent-chain.ts
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import * as fs from 'fs/promises';

export class LangChainAgentOrchestrator {
  private llm: ChatAnthropic | ChatOpenAI;
  private memory: BufferMemory;
  private artifacts: Map<string, any>;

  constructor(provider: 'anthropic' | 'openai' = 'anthropic') {
    if (provider === 'anthropic') {
      this.llm = new ChatAnthropic({
        modelName: 'claude-3-5-sonnet-20241022',
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        temperature: 0.7,
      });
    } else {
      this.llm = new ChatOpenAI({
        modelName: 'gpt-4-turbo',
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
      });
    }

    this.memory = new BufferMemory({
      memoryKey: 'agentHistory',
      returnMessages: true,
    });

    this.artifacts = new Map();
  }

  async executeAgent(
    agentId: string,
    promptPath: string,
    inputs: Record<string, any>
  ): Promise<string> {
    // Load prompt template
    const promptContent = await fs.readFile(promptPath, 'utf-8');

    // Create prompt template
    const prompt = PromptTemplate.fromTemplate(`
${promptContent}

## Input Context
{input_context}

Generate the output according to the specifications above.
Return your response as valid JSON.
    `);

    // Create chain
    const chain = new LLMChain({
      llm: this.llm,
      prompt,
      memory: this.memory,
    });

    // Execute
    const response = await chain.call({
      input_context: JSON.stringify(inputs, null, 2),
    });

    return response.text;
  }

  async executeWorkflow(
    workflow: any,
    initialInputs: Record<string, any>
  ): Promise<Map<string, any>> {
    // Store initial inputs
    for (const [key, value] of Object.entries(initialInputs)) {
      this.artifacts.set(key, value);
    }

    // Execute phases
    for (const phase of workflow.phases) {
      for (const agentConfig of phase.agents) {
        // Prepare inputs
        const inputs = this.prepareInputs(agentConfig);

        // Execute agent
        const response = await this.executeAgent(
          agentConfig.agentId,
          agentConfig.promptPath,
          inputs
        );

        // Parse and store outputs
        const outputs = JSON.parse(response);
        for (const [key, value] of Object.entries(outputs)) {
          this.artifacts.set(key, value);
        }
      }
    }

    return this.artifacts;
  }

  private prepareInputs(agentConfig: any): Record<string, any> {
    const inputs: Record<string, any> = {};

    if (agentConfig.inputs) {
      for (const inputName of agentConfig.inputs) {
        const artifact = this.artifacts.get(inputName);
        if (artifact) {
          inputs[inputName] = artifact;
        }
      }
    }

    return inputs;
  }
}
```

---

## Comparison Matrix

| Approach | Setup Time | Automation | Cost | Best For |
|----------|-----------|------------|------|----------|
| Manual | 5 min | None | Free/Paid | Learning, Prototyping |
| API-Based | 1 hour | Full | Pay-per-token | Production, CI/CD |
| IDE-Based | 15 min | Partial | Subscription | Development |
| LangChain | 2-3 hours | Full | Pay-per-token | Complex workflows |

## Next Steps

1. **Start Simple**: Try manual integration with Claude/ChatGPT
2. **Automate**: Move to API-based for production workflows
3. **Enhance**: Add LangChain for advanced features

See detailed implementation in:
- [API Integration Example](ai-integration-api-example.md)
- [IDE Integration Guide](ai-integration-ide-guide.md)
- [LangChain Advanced Guide](ai-integration-langchain.md)
