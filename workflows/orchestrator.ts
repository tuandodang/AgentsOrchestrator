/**
 * Agent Orchestrator Implementation
 *
 * This file demonstrates how to orchestrate multiple agents,
 * passing outputs from one agent as inputs to the next.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// ============================================================================
// Type Definitions
// ============================================================================

interface AgentConfig {
  id: string;
  name: string;
  category: string;
  promptTemplate: string;
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
  dependencies: string[];
}

interface InputDefinition {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface OutputDefinition {
  name: string;
  type: string;
  description: string;
}

interface AgentExecution {
  agentId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

interface WorkflowExecution {
  workflowId: string;
  phases: PhaseExecution[];
  artifacts: Map<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface PhaseExecution {
  name: string;
  sequence: number;
  agentExecutions: AgentExecution[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

// ============================================================================
// Agent Orchestrator Class
// ============================================================================

export class AgentOrchestrator {
  private agentsConfig: Map<string, AgentConfig>;
  private artifacts: Map<string, any>;

  constructor() {
    this.agentsConfig = new Map();
    this.artifacts = new Map();
  }

  /**
   * Load agent configurations from config file
   */
  async loadAgentConfigurations(configPath: string): Promise<void> {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    for (const agent of config.agents) {
      this.agentsConfig.set(agent.id, agent);
    }

    console.log(`✅ Loaded ${this.agentsConfig.size} agent configurations`);
  }

  /**
   * Execute a complete workflow
   */
  async executeWorkflow(workflowId: string, initialInputs: Record<string, any>): Promise<WorkflowExecution> {
    console.log(`\n🚀 Starting workflow: ${workflowId}`);
    console.log(`📥 Initial inputs:`, Object.keys(initialInputs));

    // Load workflow definition
    const workflow = await this.loadWorkflow(workflowId);

    const execution: WorkflowExecution = {
      workflowId,
      phases: [],
      artifacts: new Map(),
      status: 'in_progress',
    };

    // Store initial inputs as artifacts
    for (const [key, value] of Object.entries(initialInputs)) {
      this.storeArtifact(key, value);
    }

    try {
      // Execute each phase sequentially
      for (const phase of workflow.phases) {
        console.log(`\n📍 Phase ${phase.sequence}: ${phase.name}`);

        const phaseExecution: PhaseExecution = {
          name: phase.name,
          sequence: phase.sequence,
          agentExecutions: [],
          status: 'in_progress',
        };

        // Execute agents in phase (parallel if specified)
        await this.executePhase(phase, phaseExecution);

        phaseExecution.status = 'completed';
        execution.phases.push(phaseExecution);
      }

      execution.status = 'completed';
      console.log(`\n✅ Workflow completed successfully`);

    } catch (error) {
      execution.status = 'failed';
      console.error(`\n❌ Workflow failed:`, error);
      throw error;
    }

    return execution;
  }

  /**
   * Execute a single phase of the workflow
   */
  private async executePhase(
    phase: any,
    phaseExecution: PhaseExecution
  ): Promise<void> {
    const agentGroups = this.groupAgentsByDependencies(phase.agents);

    // Execute each group (agents in same group can run in parallel)
    for (const group of agentGroups) {
      const executions = await Promise.all(
        group.map(agentConfig => this.executeAgent(agentConfig))
      );

      phaseExecution.agentExecutions.push(...executions);
    }
  }

  /**
   * Execute a single agent
   */
  async executeAgent(agentConfig: any): Promise<AgentExecution> {
    const execution: AgentExecution = {
      agentId: agentConfig.agentId,
      status: 'in_progress',
      inputs: {},
      startTime: new Date(),
    };

    try {
      console.log(`\n  🤖 Executing agent: ${agentConfig.agentId}`);

      // Get agent configuration
      const config = this.agentsConfig.get(agentConfig.agentId);
      if (!config) {
        throw new Error(`Agent configuration not found: ${agentConfig.agentId}`);
      }

      // Prepare inputs by fetching from artifacts
      execution.inputs = await this.prepareAgentInputs(agentConfig, config);

      console.log(`     📥 Inputs:`, Object.keys(execution.inputs));

      // Load prompt template
      const prompt = await this.loadPromptTemplate(config.promptTemplate);

      // Execute agent (simulate AI call)
      const outputs = await this.callAgent(config, prompt, execution.inputs);

      // Store outputs as artifacts
      for (const [key, value] of Object.entries(outputs)) {
        this.storeArtifact(key, value);
      }

      execution.outputs = outputs;
      execution.status = 'completed';
      execution.endTime = new Date();

      const duration = execution.endTime.getTime() - execution.startTime.getTime();
      console.log(`     ✅ Completed in ${duration}ms`);
      console.log(`     📤 Outputs:`, Object.keys(outputs));

    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.endTime = new Date();

      console.error(`     ❌ Failed:`, execution.error);
      throw error;
    }

    return execution;
  }

  /**
   * Prepare inputs for an agent by fetching from artifact store
   */
  private async prepareAgentInputs(
    agentConfig: any,
    config: AgentConfig
  ): Promise<Record<string, any>> {
    const inputs: Record<string, any> = {};

    // Map input names from workflow config to actual inputs
    for (const inputName of agentConfig.inputs || []) {
      const artifact = this.getArtifact(inputName);
      if (!artifact) {
        // Check if input is required
        const inputDef = config.inputs.find(i => i.name === inputName);
        if (inputDef?.required) {
          throw new Error(`Required input not found: ${inputName}`);
        }
      } else {
        inputs[inputName] = artifact;
      }
    }

    // If using dependencies, fetch outputs from dependency agents
    if (agentConfig.dependsOn && agentConfig.dependsOn.length > 0) {
      for (const depAgentId of agentConfig.dependsOn) {
        const depConfig = this.agentsConfig.get(depAgentId);
        if (depConfig) {
          for (const output of depConfig.outputs) {
            const artifact = this.getArtifact(output.name);
            if (artifact) {
              inputs[output.name] = artifact;
            }
          }
        }
      }
    }

    return inputs;
  }

  /**
   * Call an agent (simulated - in reality would call AI API)
   */
  private async callAgent(
    config: AgentConfig,
    prompt: string,
    inputs: Record<string, any>
  ): Promise<Record<string, any>> {
    // In a real implementation, this would:
    // 1. Format the prompt with inputs
    // 2. Call Claude AI / OpenAI / etc.
    // 3. Parse the AI response
    // 4. Validate outputs against schema
    // 5. Return structured outputs

    // For demonstration, we'll simulate with mock data
    console.log(`     🔄 Calling AI agent (simulated)...`);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));

    // Return mock outputs based on agent type
    return this.generateMockOutputs(config, inputs);
  }

  /**
   * Generate mock outputs for demonstration
   */
  private generateMockOutputs(
    config: AgentConfig,
    inputs: Record<string, any>
  ): Record<string, any> {
    const outputs: Record<string, any> = {};

    // Generate mock outputs based on agent configuration
    for (const output of config.outputs) {
      outputs[output.name] = {
        metadata: {
          documentId: `${config.id.toUpperCase()}-${Date.now()}`,
          version: '1.0',
          createdAt: new Date().toISOString(),
          createdBy: config.id,
          basedOn: Object.keys(inputs),
        },
        content: `Mock ${output.name} generated by ${config.name}`,
        // Include reference to input data
        inputSummary: {
          inputCount: Object.keys(inputs).length,
          inputTypes: Object.keys(inputs),
        },
      };
    }

    return outputs;
  }

  /**
   * Store an artifact in the artifact store
   */
  private storeArtifact(name: string, value: any): void {
    console.log(`     💾 Storing artifact: ${name}`);
    this.artifacts.set(name, {
      name,
      value,
      storedAt: new Date(),
    });
  }

  /**
   * Retrieve an artifact from the artifact store
   */
  private getArtifact(name: string): any {
    const artifact = this.artifacts.get(name);
    return artifact?.value;
  }

  /**
   * Load workflow definition
   */
  private async loadWorkflow(workflowId: string): Promise<any> {
    const workflowPath = path.join(__dirname, '../config/workflows.json');
    const content = await fs.readFile(workflowPath, 'utf-8');
    const workflows = JSON.parse(content);

    const workflow = workflows.workflows.find((w: any) => w.id === workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return workflow;
  }

  /**
   * Load prompt template
   */
  private async loadPromptTemplate(templatePath: string): Promise<string> {
    const fullPath = path.join(__dirname, '..', templatePath);
    return await fs.readFile(fullPath, 'utf-8');
  }

  /**
   * Group agents by dependencies for parallel execution
   */
  private groupAgentsByDependencies(agents: any[]): any[][] {
    const groups: any[][] = [];
    const processed = new Set<string>();

    // Simple grouping: agents with no unmet dependencies can run together
    while (processed.size < agents.length) {
      const currentGroup: any[] = [];

      for (const agent of agents) {
        if (processed.has(agent.agentId)) continue;

        // Check if all dependencies are processed
        const deps = agent.dependsOn || [];
        const allDepsProcessed = deps.every((dep: string) => processed.has(dep));

        if (allDepsProcessed) {
          currentGroup.push(agent);
          processed.add(agent.agentId);
        }
      }

      if (currentGroup.length === 0) {
        throw new Error('Circular dependency detected or unmet dependencies');
      }

      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Get all artifacts
   */
  getAllArtifacts(): Map<string, any> {
    return this.artifacts;
  }

  /**
   * Export workflow execution report
   */
  async exportExecutionReport(
    execution: WorkflowExecution,
    outputPath: string
  ): Promise<void> {
    const report = {
      workflowId: execution.workflowId,
      status: execution.status,
      phases: execution.phases.map(phase => ({
        name: phase.name,
        sequence: phase.sequence,
        status: phase.status,
        agents: phase.agentExecutions.map(agent => ({
          agentId: agent.agentId,
          status: agent.status,
          inputs: Object.keys(agent.inputs),
          outputs: agent.outputs ? Object.keys(agent.outputs) : [],
          duration: agent.endTime && agent.startTime
            ? agent.endTime.getTime() - agent.startTime.getTime()
            : null,
          error: agent.error,
        })),
      })),
      artifacts: Array.from(this.artifacts.entries()).map(([name, artifact]) => ({
        name,
        storedAt: artifact.storedAt,
        type: typeof artifact.value,
      })),
    };

    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Execution report exported to: ${outputPath}`);
  }
}

// ============================================================================
// Example Usage
// ============================================================================

async function main() {
  const orchestrator = new AgentOrchestrator();

  // Load agent configurations
  await orchestrator.loadAgentConfigurations(
    path.join(__dirname, '../config/agents.json')
  );

  // Execute Feature Development Workflow
  const initialInputs = {
    businessRequirements: {
      feature: 'User Management System',
      description: 'Complete user management with authentication and RBAC',
      constraints: {
        timeline: '4 weeks',
        budget: '$50,000',
      },
    },
    stakeholders: [
      { name: 'John Smith', role: 'Product Owner' },
      { name: 'Sarah Johnson', role: 'Security Lead' },
    ],
  };

  try {
    const execution = await orchestrator.executeWorkflow(
      'wf-002', // Feature Development Workflow
      initialInputs
    );

    // Export execution report
    await orchestrator.exportExecutionReport(
      execution,
      path.join(__dirname, '../output/execution-report.json')
    );

    // Display final artifacts
    console.log(`\n📦 Final Artifacts:`);
    const artifacts = orchestrator.getAllArtifacts();
    for (const [name, artifact] of artifacts.entries()) {
      console.log(`   - ${name} (stored at ${artifact.storedAt.toISOString()})`);
    }

  } catch (error) {
    console.error('Workflow execution failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default AgentOrchestrator;
