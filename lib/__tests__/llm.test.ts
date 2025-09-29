import { createLLMService, LLMService } from '../llm'

describe('LLM Service', () => {
  let llmService: LLMService

  beforeEach(() => {
    llmService = createLLMService({ provider: 'mock' })
  })

  describe('Mock Provider', () => {
    it('should create service with mock provider', () => {
      expect(llmService.getProviderName()).toBe('mock')
      expect(llmService.getAvailableModels()).toContain('mock-model')
    })

    it('should submit job and return job ID', async () => {
      const jobId = await llmService.submitJob('Test prompt')
      expect(typeof jobId).toBe('string')
      expect(jobId).toMatch(/^mock_\d+_/)
    })

    it('should get job by ID', async () => {
      const jobId = await llmService.submitJob('Test prompt')
      const job = await llmService.getJob(jobId)

      expect(job.id).toBe(jobId)
      expect(job.prompt).toBe('Test prompt')
      expect(job.status).toBe('processing')
    })

    it('should list jobs', async () => {
      await llmService.submitJob('Test prompt 1')
      await llmService.submitJob('Test prompt 2')

      const jobs = await llmService.listJobs(10, 0)
      expect(jobs.length).toBeGreaterThan(0)
      expect(jobs[0].created).toBeDefined()
    })

    it('should estimate tokens', () => {
      const text = 'Hello world'
      const tokens = llmService.estimateTokens(text)
      expect(tokens).toBeGreaterThan(0)
      expect(typeof tokens).toBe('number')
    })

    it('should estimate cost', () => {
      const tokens = 100
      const cost = llmService.estimateCost(tokens)
      expect(typeof cost).toBe('number')
      expect(cost).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Token Estimation', () => {
    it('should estimate tokens for different text lengths', () => {
      expect(llmService.estimateTokens('a')).toBe(1)
      expect(llmService.estimateTokens('hello world')).toBe(3)
      expect(llmService.estimateTokens('a'.repeat(100))).toBe(25)
    })
  })

  describe('Cost Estimation', () => {
    it('should estimate cost for different token amounts', () => {
      expect(llmService.estimateCost(0)).toBe(0)
      expect(llmService.estimateCost(1000)).toBeGreaterThan(0)
    })
  })
})
