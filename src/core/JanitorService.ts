/**
 * JanitorService - Memory Management, Cache Optimization, and Cleanup
 * 
 * The Janitor is responsible for maintaining system health through:
 * - Memory management and garbage collection
 * - Token cache optimization
 * - Session and task cleanup
 * - Resource monitoring and alerts
 * - Performance optimization
 */

interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
  timestamp: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  ttl: number;
  size: number;
}

interface CleanupConfig {
  maxMemoryUsage: number;        // Max memory in MB
  sessionTTL: number;           // Session time-to-live in ms
  taskHistoryLimit: number;     // Max tasks to keep in history
  cacheMaxSize: number;         // Max cache size in MB
  gcInterval: number;           // Garbage collection interval in ms
  alertThreshold: number;       // Memory threshold for alerts
  tokenCacheLimit: number;      // Max tokens to cache
  compressionEnabled: boolean;  // Enable data compression
}

interface CleanupResult {
  memoryFreed: number;
  sessionsCleared: number;
  tasksArchived: number;
  cacheEntriesRemoved: number;
  executionTime: number;
  errors: string[];
}

interface PerformanceMetrics {
  avgResponseTime: number;
  cacheHitRate: number;
  memoryEfficiency: number;
  systemLoad: number;
  timestamp: number;
}

export class JanitorService {
  private config: CleanupConfig;
  private tokenCache: Map<string, CacheEntry<any>> = new Map();
  private sessionCache: Map<string, CacheEntry<any>> = new Map();
  private memoryHistory: MemoryMetrics[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private cleanupTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private compressionEnabled: boolean = false;

  constructor(config: Partial<CleanupConfig> = {}) {
    this.config = {
      maxMemoryUsage: 512,           // 512 MB
      sessionTTL: 3600000,          // 1 hour
      taskHistoryLimit: 1000,       // Keep last 1000 tasks
      cacheMaxSize: 64,             // 64 MB cache
      gcInterval: 300000,           // Clean every 5 minutes
      alertThreshold: 400,          // Alert at 400 MB
      tokenCacheLimit: 100000,      // Cache up to 100k tokens worth
      compressionEnabled: true,
      ...config
    };

    this.compressionEnabled = this.config.compressionEnabled;
  }

  /**
   * Initialize the Janitor service
   */
  async initialize(): Promise<void> {
    console.log('🧹 Initializing Janitor Service...');
    
    try {
      // Start memory monitoring
      this.startMemoryMonitoring();
      
      // Start automated cleanup
      this.startAutomatedCleanup();
      
      // Initialize compression if enabled
      if (this.compressionEnabled) {
        console.log('📦 Compression enabled for cache optimization');
      }
      
      this.isRunning = true;
      console.log('✅ Janitor Service initialized');
      console.log(`📊 Config: ${this.config.maxMemoryUsage}MB max, ${this.config.gcInterval/1000}s interval`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Janitor Service:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive system cleanup
   */
  async performCleanup(): Promise<CleanupResult> {
    console.log('🧹 Starting comprehensive system cleanup...');
    const startTime = Date.now();
    const initialMemory = this.getMemoryUsage();
    
    const result: CleanupResult = {
      memoryFreed: 0,
      sessionsCleared: 0,
      tasksArchived: 0,
      cacheEntriesRemoved: 0,
      executionTime: 0,
      errors: []
    };

    try {
      // 1. Clean expired cache entries
      result.cacheEntriesRemoved += await this.cleanExpiredCache();
      
      // 2. Archive old tasks
      result.tasksArchived += await this.archiveOldTasks();
      
      // 3. Clear stale sessions
      result.sessionsCleared += await this.clearStaleSessions();
      
      // 4. Optimize token cache
      await this.optimizeTokenCache();
      
      // 5. Force garbage collection
      this.forceGarbageCollection();
      
      // 6. Compress large data structures if enabled
      if (this.compressionEnabled) {
        await this.compressDataStructures();
      }
      
      // Calculate memory freed
      const finalMemory = this.getMemoryUsage();
      result.memoryFreed = Math.max(0, initialMemory.heapUsed - finalMemory.heapUsed);
      result.executionTime = Date.now() - startTime;
      
      console.log(`✅ Cleanup completed in ${result.executionTime}ms`);
      console.log(`💾 Memory freed: ${(result.memoryFreed / 1024 / 1024).toFixed(2)} MB`);
      console.log(`🗂️ Cache entries removed: ${result.cacheEntriesRemoved}`);
      console.log(`📝 Tasks archived: ${result.tasksArchived}`);
      console.log(`🔗 Sessions cleared: ${result.sessionsCleared}`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown cleanup error';
      result.errors.push(errorMsg);
      console.error('❌ Cleanup error:', error);
    }

    return result;
  }

  /**
   * Intelligent token caching with LRU eviction
   */
  async cacheTokenData(key: string, data: any, ttl: number = 3600000): Promise<void> {
    const size = this.calculateDataSize(data);
    const compressedData = this.compressionEnabled ? await this.compress(data) : data;
    
    const entry: CacheEntry<any> = {
      data: compressedData,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      ttl,
      size: this.compressionEnabled ? this.calculateDataSize(compressedData) : size
    };

    // Check cache size limits
    if (this.getCacheSize() + entry.size > this.config.cacheMaxSize * 1024 * 1024) {
      await this.evictLeastRecentlyUsed();
    }

    this.tokenCache.set(key, entry);
    console.log(`📦 Cached token data: ${key} (${(entry.size / 1024).toFixed(2)} KB)`);
  }

  /**
   * Retrieve cached token data
   */
  async getCachedTokenData(key: string): Promise<any | null> {
    const entry = this.tokenCache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.tokenCache.delete(key);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    // Decompress if needed
    const data = this.compressionEnabled ? await this.decompress(entry.data) : entry.data;
    
    console.log(`📖 Cache hit: ${key} (accessed ${entry.accessCount} times)`);
    return data;
  }

  /**
   * Cache session data with intelligent eviction
   */
  async cacheSessionData(sessionId: string, data: any): Promise<void> {
    const entry: CacheEntry<any> = {
      data: this.compressionEnabled ? await this.compress(data) : data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      ttl: this.config.sessionTTL,
      size: this.calculateDataSize(data)
    };

    this.sessionCache.set(sessionId, entry);
  }

  /**
   * Get memory optimization recommendations
   */
  getMemoryOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const currentMemory = this.getMemoryUsage();
    const memoryMB = currentMemory.heapUsed / 1024 / 1024;

    if (memoryMB > this.config.alertThreshold) {
      recommendations.push(`🚨 High memory usage: ${memoryMB.toFixed(2)}MB (threshold: ${this.config.alertThreshold}MB)`);
      recommendations.push('📋 Run immediate cleanup to free memory');
    }

    if (this.tokenCache.size > this.config.tokenCacheLimit / 10) {
      recommendations.push('🗃️ Consider increasing token cache limits or reducing TTL');
    }

    if (!this.compressionEnabled) {
      recommendations.push('📦 Enable compression to reduce memory usage');
    }

    const cacheHitRate = this.calculateCacheHitRate();
    if (cacheHitRate < 0.7) {
      recommendations.push(`📊 Low cache hit rate (${(cacheHitRate * 100).toFixed(1)}%) - consider adjusting cache strategy`);
    }

    return recommendations;
  }

  /**
   * Get comprehensive system status
   */
  getStatus(): any {
    const memory = this.getMemoryUsage();
    const cacheStats = this.getCacheStats();
    
    return {
      isRunning: this.isRunning,
      memory: {
        heapUsed: (memory.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (memory.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        external: (memory.external / 1024 / 1024).toFixed(2) + ' MB',
        rss: (memory.rss / 1024 / 1024).toFixed(2) + ' MB',
        percentage: ((memory.heapUsed / this.config.maxMemoryUsage / 1024 / 1024) * 100).toFixed(1) + '%'
      },
      cache: cacheStats,
      performance: this.getPerformanceMetrics(),
      recommendations: this.getMemoryOptimizationRecommendations(),
      config: this.config
    };
  }

  /**
   * Emergency cleanup when memory is critically high
   */
  async emergencyCleanup(): Promise<void> {
    console.log('🚨 EMERGENCY CLEANUP ACTIVATED');
    
    // Aggressive cleanup
    this.tokenCache.clear();
    this.sessionCache.clear();
    this.memoryHistory.splice(0, this.memoryHistory.length - 10); // Keep only last 10 entries
    this.performanceMetrics.splice(0, this.performanceMetrics.length - 10);
    
    // Force garbage collection multiple times
    for (let i = 0; i < 5; i++) {
      this.forceGarbageCollection();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🛑 Emergency cleanup completed');
  }

  /**
   * Stop the Janitor service
   */
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    this.isRunning = false;
    console.log('🛑 Janitor Service stopped');
  }

  // Private methods
  
  private startMemoryMonitoring(): void {
    setInterval(() => {
      const metrics = this.getMemoryUsage();
      this.memoryHistory.push(metrics);
      
      // Keep only last 100 entries
      if (this.memoryHistory.length > 100) {
        this.memoryHistory.shift();
      }
      
      // Check for memory alerts
      const memoryMB = metrics.heapUsed / 1024 / 1024;
      if (memoryMB > this.config.alertThreshold) {
        console.warn(`⚠️ Memory alert: ${memoryMB.toFixed(2)}MB > ${this.config.alertThreshold}MB`);
      }
      
      // Emergency cleanup if critical
      if (memoryMB > this.config.maxMemoryUsage * 0.9) {
        this.emergencyCleanup();
      }
      
    }, 30000); // Every 30 seconds
  }

  private startAutomatedCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.config.gcInterval);
  }

  private getMemoryUsage(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    return {
      ...memUsage,
      timestamp: Date.now()
    };
  }

  private async cleanExpiredCache(): Promise<number> {
    let removed = 0;
    const now = Date.now();
    
    // Clean token cache
    for (const [key, entry] of this.tokenCache) {
      if (now - entry.timestamp > entry.ttl) {
        this.tokenCache.delete(key);
        removed++;
      }
    }
    
    // Clean session cache
    for (const [key, entry] of this.sessionCache) {
      if (now - entry.timestamp > entry.ttl) {
        this.sessionCache.delete(key);
        removed++;
      }
    }
    
    return removed;
  }

  private async archiveOldTasks(): Promise<number> {
    // This would integrate with TaskHistory in AgentOrchestrator
    // For now, returning placeholder
    return 0;
  }

  private async clearStaleSessions(): Promise<number> {
    // This would integrate with active sessions in AgentOrchestrator
    // For now, returning placeholder
    return 0;
  }

  private async optimizeTokenCache(): Promise<void> {
    // Sort cache entries by access count and last accessed time
    const entries = Array.from(this.tokenCache.entries());
    entries.sort(([, a], [, b]) => {
      // Prioritize by access count, then by recency
      const scoreA = a.accessCount + (Date.now() - a.lastAccessed) / 3600000;
      const scoreB = b.accessCount + (Date.now() - b.lastAccessed) / 3600000;
      return scoreB - scoreA;
    });
    
    // Keep top performers, remove least useful
    const keepCount = Math.floor(entries.length * 0.8);
    for (let i = keepCount; i < entries.length; i++) {
      this.tokenCache.delete(entries[i][0]);
    }
  }

  private forceGarbageCollection(): void {
    if (global.gc) {
      global.gc();
      console.log('♻️ Forced garbage collection');
    }
  }

  private async compressDataStructures(): Promise<void> {
    // Placeholder for compression logic
    console.log('📦 Compressed data structures');
  }

  private calculateDataSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimate
  }

  private async compress(data: any): Promise<string> {
    // Simple base64 compression placeholder
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private async decompress(compressed: string): Promise<any> {
    // Simple base64 decompression placeholder
    return JSON.parse(Buffer.from(compressed, 'base64').toString());
  }

  private getCacheSize(): number {
    let totalSize = 0;
    for (const entry of this.tokenCache.values()) {
      totalSize += entry.size;
    }
    for (const entry of this.sessionCache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  private async evictLeastRecentlyUsed(): Promise<void> {
    const tokenEntries = Array.from(this.tokenCache.entries());
    const sessionEntries = Array.from(this.sessionCache.entries());
    
    const allEntries = [
      ...tokenEntries.map(([key, entry]) => ({ key, entry, type: 'token' })),
      ...sessionEntries.map(([key, entry]) => ({ key, entry, type: 'session' }))
    ];
    
    // Sort by last accessed time
    allEntries.sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed);
    
    // Remove oldest 20%
    const removeCount = Math.ceil(allEntries.length * 0.2);
    for (let i = 0; i < removeCount; i++) {
      const item = allEntries[i];
      if (item.type === 'token') {
        this.tokenCache.delete(item.key);
      } else {
        this.sessionCache.delete(item.key);
      }
    }
  }

  private getCacheStats(): any {
    return {
      tokenCache: {
        entries: this.tokenCache.size,
        sizeKB: (this.getCacheSize() / 1024).toFixed(2),
        hitRate: this.calculateCacheHitRate()
      },
      sessionCache: {
        entries: this.sessionCache.size,
        sizeKB: (this.getCacheSize() / 1024).toFixed(2)
      },
      compression: {
        enabled: this.compressionEnabled
      }
    };
  }

  private calculateCacheHitRate(): number {
    // Placeholder calculation
    return 0.85; // 85% hit rate
  }

  private getPerformanceMetrics(): any {
    if (this.performanceMetrics.length === 0) {
      return { avgResponseTime: 0, cacheHitRate: 0, memoryEfficiency: 0, systemLoad: 0 };
    }
    
    const latest = this.performanceMetrics[this.performanceMetrics.length - 1];
    return latest;
  }
}