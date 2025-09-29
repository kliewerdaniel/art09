import { cn } from '../utils'

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar')
    })

    it('should handle Tailwind CSS conflicts', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })

    it('should merge with clsx-like syntax', () => {
      expect(cn('foo', { bar: true, baz: false })).toBe('foo bar')
    })
  })
})
