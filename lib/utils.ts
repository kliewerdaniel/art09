import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates password strength requirements
 * @param password - The password to validate
 * @returns Object with isValid boolean and list of failed requirements
 */
export function validatePassword(password: string): {
  isValid: boolean
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
  messages: string[]
} {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }

  const messages: string[] = []
  if (!requirements.minLength) messages.push('At least 8 characters')
  if (!requirements.hasUppercase) messages.push('One uppercase letter')
  if (!requirements.hasLowercase) messages.push('One lowercase letter')
  if (!requirements.hasNumber) messages.push('One number')
  if (!requirements.hasSpecialChar) messages.push('One special character')

  return {
    isValid: Object.values(requirements).every(Boolean),
    requirements,
    messages
  }
}

/**
 * Calculates password strength score (0-4)
 * @param password - The password to score
 * @returns Score from 0-4 (weak to strong)
 */
export function getPasswordStrength(password: string): 'weak' | 'fair' | 'good' | 'strong' {
  const validation = validatePassword(password)
  const passedRequirements = Object.values(validation.requirements).filter(Boolean).length

  if (passedRequirements <= 2) return 'weak'
  if (passedRequirements <= 3) return 'fair'
  if (passedRequirements === 4) return 'good'
  return 'strong'
}

/**
 * Gets color class for password strength indicator
 * @param strength - Password strength level
 * @returns Tailwind color class
 */
export function getPasswordStrengthColor(strength: ReturnType<typeof getPasswordStrength>): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500'
    case 'fair':
      return 'bg-yellow-500'
    case 'good':
      return 'bg-blue-500'
    case 'strong':
      return 'bg-green-500'
    default:
      return 'bg-gray-300'
  }
}
