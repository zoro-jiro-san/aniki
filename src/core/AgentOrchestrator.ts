import { TreasuryManager } from './TreasuryManager';
import { SecurityManager } from '../security/SecurityManager';
import { JanitorService } from './JanitorService';

interface AgentTask {
  id: string;
  name: string;
  description: string;
  budget: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  securityRequired: boolean;
  maxConcurrent: number;
  retryOnFailure: boolean;
  maxRetries: number;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  result?: any;
}

interface SubTask {
  id: string;
  parentTaskId: string;
  name: string;
  description: string;
  budget: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  tokensUsed: number;
  suiSpent: number;
  result?: any;
  error?: string;
}

interface AgentSession {
  id: string;
  taskId: string;
  agentType: string;
  status: 'initializing' | 'running' | 'completed' | 'failed' | 'terminated';
  allocation: any;
  tokensUsed: number;
  suiSpent: number;
  startedAt: number;
  completedAt?: number;
  securityLevel: string;
  transactionHashes: string[];
}

interface TaskDecomposition {
  originalTask: string;
  subTasks: Omit<SubTask, 'id' | 'parentTaskId' | 'createdAt' | 'tokensUsed' | 'suiSpent'>[];
  estimatedTotalBudget: number;
  estimatedDuration: number;
  dependencies: { [taskName: string]: string[] };
}

interface AgentExecutionResult {
  success: boolean;
  taskId: string;
  subTasks: SubTask[];
  totalTokensUsed: number;
  totalSuiSpent: number;
  executionTime: number;
  successRate: number;
  result?: any;
  error?: string;
}

export class AgentOrchestrator {
  private treasuryManager: TreasuryManager;
  private securityManager: SecurityManager;
  private janitorService: JanitorService;
  private activeTasks: Map<string, AgentTask> = new Map();
  private activeSubTasks: Map<string, SubTask> = new Map();
  private activeSessions: Map<string, AgentSession> = new Map();
  private taskHistory: AgentTask[] = [];
  private maxConcurrentTasks: number = 10;
  private taskDecomposer: TaskDecomposer;

  constructor(treasuryManager: TreasuryManager, securityManager: SecurityManager, janitorService: JanitorService) {
    this.treasuryManager = treasuryManager;
    this.securityManager = securityManager;
    this.janitorService = janitorService;
    this.taskDecomposer = new TaskDecomposer();
  }

  /**
   * Initialize agent orchestrator
   */
  async initialize(): Promise<void> {
    console.log('🤖 Initializing Agent Orchestrator...');
    
    try {
      // Setup task monitoring
      this.startTaskMonitoring();
      
      // Initialize task decomposer with Sui-specific patterns
      await this.taskDecomposer.initializeSuiPatterns();
      
      console.log('✅ Agent Orchestrator initialized');
      console.log(`📊 Max Concurrent Tasks: ${this.maxConcurrentTasks}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Agent Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Execute a task with automatic decomposition and parallel sub-agents
   */
  async executeTask(taskParams: any, allocation: any): Promise<AgentExecutionResult> {
    console.log(`🚀 Executing task: ${taskParams.task}`);
    
    const startTime = Date.now();
    
    // Create main task
    const task: AgentTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: taskParams.task,
      description: taskParams.task,
      budget: taskParams.budget,
      priority: this.determinePriority(taskParams),
      securityRequired: taskParams.securityRequired || false,
      maxConcurrent: taskParams.maxConcurrent || 3,
      retryOnFailure: taskParams.retryOnFailure || true,
      maxRetries: 3,
      dependencies: [],
      status: 'pending',
      createdAt: Date.now()
    };

    this.activeTasks.set(task.id, task);

    try {
      // Decompose task into sub-tasks
      const decomposition = await this.decomposeTask(task);
      
      // Execute sub-tasks with orchestration
      const subTaskResults = await this.executeSubTasks(task, decomposition);
      
      // Aggregate results
      const result = await this.aggregateResults(task, subTaskResults);
      
      task.status = 'completed';
      task.completedAt = Date.now();
      task.result = result;
      
      console.log(`✅ Task completed: ${task.id}`);
      
      return {
        success: true,
        taskId: task.id,
        subTasks: subTaskResults,
        totalTokensUsed: subTaskResults.reduce((sum, st) => sum + st.tokensUsed, 0),
        totalSuiSpent: subTaskResults.reduce((sum, st) => sum + st.suiSpent, 0),
        executionTime: Date.now() - startTime,
        successRate: this.calculateSuccessRate(subTaskResults),
        result
      };
      
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completedAt = Date.now();
      
      console.error(`❌ Task failed: ${task.id}`, error);
      
      return {
        success: false,
        taskId: task.id,
        subTasks: [],
        totalTokensUsed: 0,
        totalSuiSpent: 0,
        executionTime: Date.now() - startTime,
        successRate: 0,
        error: task.error
      };
    } finally {
      // Move to history
      this.moveTaskToHistory(task);
    }
  }

  /**
   * Stop all active agents
   */
  async stopAllAgents(): Promise<void> {
    console.log('🛑 Stopping all active agents...');
    
    const stopPromises: Promise<void>[] = [];
    
    // Stop all active sessions
    for (const [sessionId, session] of this.activeSessions) {
      if (session.status === 'running') {
        stopPromises.push(this.terminateSession(sessionId));
      }
    }

    // Cancel all pending tasks
    for (const [taskId, task] of this.activeTasks) {
      if (task.status === 'pending' || task.status === 'running') {
        task.status = 'cancelled';
        console.log(`❌ Cancelled task: ${taskId}`);
      }
    }

    await Promise.all(stopPromises);
    console.log('🛑 All agents stopped');
  }

  /**
   * Get orchestrator status
   */
  getStatus(): any {
    const activeTasks = Array.from(this.activeTasks.values());
    const activeSessions = Array.from(this.activeSessions.values());
    
    return {
      activeTasks: activeTasks.length,
      pendingTasks: activeTasks.filter(t => t.status === 'pending').length,
      runningTasks: activeTasks.filter(t => t.status === 'running').length,
      activeSessions: activeSessions.length,
      runningSessions: activeSessions.filter(s => s.status === 'running').length,
      totalTasksProcessed: this.taskHistory.length,
      maxConcurrentTasks: this.maxConcurrentTasks,
      averageExecutionTime: this.calculateAverageExecutionTime(),
      successRate: this.calculateOverallSuccessRate(),
      memoryManagement: {
        taskHistorySize: this.taskHistory.length,
        activeDataStructures: this.activeTasks.size + this.activeSubTasks.size + this.activeSessions.size,
        janitorEnabled: true
      }
    };
  }

  /**
   * Decompose task into executable sub-tasks
   */
  private async decomposeTask(task: AgentTask): Promise<TaskDecomposition> {
    console.log(`🔍 Decomposing task: ${task.name}`);
    
    const decomposition = await this.taskDecomposer.decompose(task.description, task.budget);
    
    console.log(`📋 Created ${decomposition.subTasks.length} sub-tasks`);
    decomposition.subTasks.forEach((subTask, index) => {
      console.log(`  ${index + 1}. ${subTask.name} (${subTask.budget} SUI, ${subTask.priority})`);
    });
    
    return decomposition;
  }

  /**
   * Execute sub-tasks with proper orchestration
   */
  private async executeSubTasks(mainTask: AgentTask, decomposition: TaskDecomposition): Promise<SubTask[]> {
    const subTasks: SubTask[] = decomposition.subTasks.map((st, index) => ({
      ...st,
      id: `subtask_${mainTask.id}_${index}`,
      parentTaskId: mainTask.id,
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
      tokensUsed: 0,
      suiSpent: 0
    }));

    // Add to active tracking
    subTasks.forEach(st => this.activeSubTasks.set(st.id, st));

    // Execute with respect to dependencies and concurrency limits
    const completedSubTasks: SubTask[] = [];
    const concurrencyQueue = new Set<SubTask>();

    while (completedSubTasks.length < subTasks.length) {
      // Find ready tasks (dependencies met)
      const readyTasks = subTasks.filter(st => 
        st.status === 'pending' && 
        this.areDependenciesMet(st, completedSubTasks, decomposition.dependencies)
      );

      // Add to queue up to concurrency limit
      for (const task of readyTasks) {
        if (concurrencyQueue.size < mainTask.maxConcurrent && !concurrencyQueue.has(task)) {
          concurrencyQueue.add(task);
          this.executeSubTask(task).then(() => {
            concurrencyQueue.delete(task);
          });
        }
      }

      // Wait for any task to complete
      await this.waitForTaskCompletion(Array.from(concurrencyQueue));
      
      // Move completed tasks
      for (const task of Array.from(concurrencyQueue)) {
        if (task.status === 'completed' || task.status === 'failed') {
          completedSubTasks.push(task);
          concurrencyQueue.delete(task);
        }
      }

      // Prevent infinite loop
      if (readyTasks.length === 0 && concurrencyQueue.size === 0) {
        throw new Error('Task execution deadlock - no ready tasks available');
      }
    }

    return completedSubTasks;
  }

  /**
   * Execute a single sub-task
   */
  private async executeSubTask(subTask: SubTask): Promise<void> {
    console.log(`🔄 Executing sub-task: ${subTask.name}`);
    
    subTask.status = 'running';
    subTask.startedAt = Date.now();

    try {
      // Security check for sub-task
      const securityCheck = await this.securityManager.assessTask({
        budget: subTask.budget,
        securityRequired: subTask.priority === 'critical'
      });

      if (!securityCheck.approved) {
        throw new Error(`Sub-task security check failed: ${securityCheck.reason}`);
      }

      // Allocate budget for sub-task
      const allocation = await this.treasuryManager.allocateBudget(
        subTask.budget, 
        subTask.priority === 'critical'
      );

      // Create agent session
      const session = await this.createAgentSession(subTask, allocation);

      // Execute the actual task (simulated for hackathon)
      const result = await this.simulateTaskExecution(subTask, session);

      subTask.result = result;
      subTask.tokensUsed = session.tokensUsed;
      subTask.suiSpent = session.suiSpent;
      subTask.status = 'completed';
      subTask.completedAt = Date.now();
      
      console.log(`✅ Sub-task completed: ${subTask.name} (${session.tokensUsed} tokens, ${session.suiSpent} SUI)`);

    } catch (error) {
      console.error(`❌ Sub-task failed: ${subTask.name}`, error);
      
      subTask.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Retry logic
      if (subTask.retryCount < subTask.maxRetries) {
        subTask.retryCount++;
        subTask.status = 'pending';
        console.log(`🔄 Retrying sub-task: ${subTask.name} (attempt ${subTask.retryCount}/${subTask.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * subTask.retryCount)); // Exponential backoff
        return this.executeSubTask(subTask);
      } else {
        subTask.status = 'failed';
        subTask.completedAt = Date.now();
      }
    } finally {
      this.activeSubTasks.delete(subTask.id);
    }
  }

  /**
   * Create an agent session
   */
  private async createAgentSession(subTask: SubTask, allocation: any): Promise<AgentSession> {
    const session: AgentSession = {
      id: `session_${subTask.id}`,
      taskId: subTask.parentTaskId,
      agentType: this.determineAgentType(subTask),
      status: 'initializing',
      allocation,
      tokensUsed: 0,
      suiSpent: 0,
      startedAt: Date.now(),
      securityLevel: allocation.securityLevel,
      transactionHashes: []
    };

    this.activeSessions.set(session.id, session);
    
    // Cache session data for janitor management
    await this.janitorService.cacheSessionData(session.id, {
      subTaskName: subTask.name,
      agentType: session.agentType,
      startedAt: session.startedAt,
      allocation: allocation
    });
    
    return session;
  }

  /**
   * Simulate task execution (for hackathon demo)
   */
  private async simulateTaskExecution(subTask: SubTask, session: AgentSession): Promise<any> {
    session.status = 'running';
    
    // Simulate execution time based on task complexity
    const executionTime = Math.random() * 2000 + 500; // 500-2500ms
    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Simulate resource usage
    session.tokensUsed = Math.floor(subTask.budget * 0.1 + Math.random() * 1000);
    session.suiSpent = Math.floor(subTask.budget * 0.05 + Math.random() * 100);

    // Simulate success/failure (90% success rate)
    if (Math.random() < 0.9) {
      session.status = 'completed';
      return {
        success: true,
        data: `Completed ${subTask.name}`,
        metrics: {
          executionTime,
          tokensUsed: session.tokensUsed,
          suiSpent: session.suiSpent
        }
      };
    } else {
      session.status = 'failed';
      throw new Error(`Simulated failure for ${subTask.name}`);
    }
  }

  /**
   * Aggregate results from all sub-tasks
   */
  private async aggregateResults(mainTask: AgentTask, subTasks: SubTask[]): Promise<any> {
    console.log(`📊 Aggregating results for task: ${mainTask.name}`);
    
    const successful = subTasks.filter(st => st.status === 'completed');
    const failed = subTasks.filter(st => st.status === 'failed');
    
    const aggregation = {
      totalSubTasks: subTasks.length,
      successful: successful.length,
      failed: failed.length,
      successRate: successful.length / subTasks.length,
      totalTokensUsed: subTasks.reduce((sum, st) => sum + st.tokensUsed, 0),
      totalSuiSpent: subTasks.reduce((sum, st) => sum + st.suiSpent, 0),
      executionTime: Date.now() - mainTask.createdAt,
      results: successful.map(st => st.result),
      errors: failed.map(st => st.error).filter(Boolean)
    };

    console.log(`📈 Aggregation complete: ${aggregation.successful}/${aggregation.totalSubTasks} successful`);
    return aggregation;
  }

  /**
   * Determine task priority based on parameters
   */
  private determinePriority(taskParams: any): 'low' | 'medium' | 'high' | 'critical' {
    if (taskParams.budget > 100000) return 'critical';
    if (taskParams.budget > 10000) return 'high';
    if (taskParams.budget > 1000) return 'medium';
    return 'low';
  }

  /**
   * Determine agent type based on sub-task
   */
  private determineAgentType(subTask: SubTask): string {
    // Simple classification based on task name/description
    const description = subTask.description.toLowerCase();
    
    if (description.includes('analyze') || description.includes('research')) {
      return 'analyst';
    }
    if (description.includes('write') || description.includes('document')) {
      return 'writer';
    }
    if (description.includes('validate') || description.includes('test')) {
      return 'validator';
    }
    if (description.includes('execute') || description.includes('deploy')) {
      return 'executor';
    }
    
    return 'generalist';
  }

  /**
   * Check if task dependencies are met
   */
  private areDependenciesMet(
    task: SubTask, 
    completedTasks: SubTask[], 
    dependencies: { [taskName: string]: string[] }
  ): boolean {
    const taskDeps = dependencies[task.name] || [];
    return taskDeps.every(dep => 
      completedTasks.some(ct => ct.name === dep && ct.status === 'completed')
    );
  }

  /**
   * Wait for any task in the queue to complete
   */
  private async waitForTaskCompletion(tasks: SubTask[]): Promise<void> {
    return new Promise(resolve => {
      const checkCompletion = () => {
        if (tasks.some(t => t.status === 'completed' || t.status === 'failed')) {
          resolve();
        } else {
          setTimeout(checkCompletion, 100);
        }
      };
      checkCompletion();
    });
  }

  /**
   * Terminate a session
   */
  private async terminateSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'terminated';
      session.completedAt = Date.now();
      console.log(`🛑 Session terminated: ${sessionId}`);
    }
  }

  /**
   * Move task to history
   */
  private moveTaskToHistory(task: AgentTask): void {
    this.activeTasks.delete(task.id);
    this.taskHistory.push(task);
    
    // Keep only last 100 tasks in history
    if (this.taskHistory.length > 100) {
      this.taskHistory.splice(0, this.taskHistory.length - 100);
    }
  }

  /**
   * Calculate success rate for sub-tasks
   */
  private calculateSuccessRate(subTasks: SubTask[]): number {
    if (subTasks.length === 0) return 0;
    const successful = subTasks.filter(st => st.status === 'completed').length;
    return successful / subTasks.length;
  }

  /**
   * Calculate average execution time
   */
  private calculateAverageExecutionTime(): number {
    const completedTasks = this.taskHistory.filter(t => t.completedAt);
    if (completedTasks.length === 0) return 0;
    
    const totalTime = completedTasks.reduce((sum, t) => 
      sum + (t.completedAt! - t.createdAt), 0
    );
    
    return totalTime / completedTasks.length;
  }

  /**
   * Calculate overall success rate
   */
  private calculateOverallSuccessRate(): number {
    if (this.taskHistory.length === 0) return 0;
    const successful = this.taskHistory.filter(t => t.status === 'completed').length;
    return successful / this.taskHistory.length;
  }

  /**
   * Start task monitoring
   */
  private startTaskMonitoring(): void {
    setInterval(() => {
      this.cleanupCompletedSessions();
      this.checkForStuckTasks();
    }, 60000); // Every minute

    console.log('📊 Task monitoring started');
  }

  /**
   * Cleanup completed sessions with janitor integration
   */
  private cleanupCompletedSessions(): void {
    let cleanedCount = 0;
    for (const [sessionId, session] of this.activeSessions) {
      if (session.status === 'completed' || session.status === 'failed' || session.status === 'terminated') {
        if (session.completedAt && Date.now() - session.completedAt > 300000) { // 5 minutes
          this.activeSessions.delete(sessionId);
          cleanedCount++;
        }
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Janitor: Cleaned ${cleanedCount} completed sessions`);
    }
  }

  /**
   * Check for stuck tasks
   */
  private checkForStuckTasks(): void {
    const now = Date.now();
    const stuckThreshold = 600000; // 10 minutes
    
    for (const [taskId, task] of this.activeTasks) {
      if (task.status === 'running' && now - task.createdAt > stuckThreshold) {
        console.warn(`⚠️ Stuck task detected: ${taskId} (running for ${(now - task.createdAt) / 1000}s)`);
        task.status = 'failed';
        task.error = 'Task timeout - execution took too long';
        task.completedAt = now;
      }
    }
  }
}

/**
 * Task Decomposer - analyzes tasks and breaks them into sub-tasks
 */
class TaskDecomposer {
  private suiPatterns: Map<string, any> = new Map();

  async initializeSuiPatterns(): Promise<void> {
    // Initialize Sui-specific task patterns
    this.suiPatterns.set('treasury-management', {
      keywords: ['manage', 'treasury', 'balance', 'portfolio'],
      subTasks: [
        { name: 'Analyze current positions', priority: 'high' },
        { name: 'Calculate optimal allocation', priority: 'medium' },
        { name: 'Execute rebalancing', priority: 'critical' },
        { name: 'Validate final state', priority: 'medium' }
      ]
    });

    this.suiPatterns.set('defi-operations', {
      keywords: ['defi', 'stake', 'pool', 'yield', 'farming'],
      subTasks: [
        { name: 'Research DeFi protocols', priority: 'high' },
        { name: 'Assess risk parameters', priority: 'high' },
        { name: 'Execute DeFi transactions', priority: 'critical' },
        { name: 'Monitor positions', priority: 'medium' }
      ]
    });

    console.log('🎯 Sui task patterns initialized');
  }

  async decompose(taskDescription: string, totalBudget: number): Promise<TaskDecomposition> {
    // Analyze task description
    const pattern = this.analyzeTaskPattern(taskDescription);
    
    // Generate sub-tasks
    const subTasks = this.generateSubTasks(pattern, taskDescription, totalBudget);
    
    // Calculate dependencies
    const dependencies = this.calculateDependencies(subTasks);
    
    return {
      originalTask: taskDescription,
      subTasks,
      estimatedTotalBudget: totalBudget,
      estimatedDuration: subTasks.length * 2000, // Rough estimate
      dependencies
    };
  }

  private analyzeTaskPattern(description: string): any {
    const desc = description.toLowerCase();
    
    for (const [patternName, pattern] of this.suiPatterns) {
      if (pattern.keywords.some((keyword: string) => desc.includes(keyword))) {
        return { name: patternName, ...pattern };
      }
    }

    // Default decomposition
    return {
      name: 'generic',
      subTasks: [
        { name: 'Analyze requirements', priority: 'medium' },
        { name: 'Execute main task', priority: 'high' },
        { name: 'Validate results', priority: 'medium' }
      ]
    };
  }

  private generateSubTasks(pattern: any, description: string, totalBudget: number): any[] {
    const budgetPerTask = Math.floor(totalBudget / pattern.subTasks.length);
    
    return pattern.subTasks.map((template: any, index: number) => ({
      name: template.name,
      description: `${template.name} for: ${description}`,
      budget: budgetPerTask + (index === 0 ? totalBudget % pattern.subTasks.length : 0), // Add remainder to first task
      priority: template.priority,
      status: 'pending',
      retryCount: 0,
      maxRetries: 3
    }));
  }

  private calculateDependencies(subTasks: any[]): { [taskName: string]: string[] } {
    // Simple dependency calculation
    const dependencies: { [taskName: string]: string[] } = {};
    
    for (let i = 1; i < subTasks.length; i++) {
      // Each task depends on the previous one (simple sequential dependency)
      dependencies[subTasks[i].name] = [subTasks[i - 1].name];
    }
    
    return dependencies;
  }
}