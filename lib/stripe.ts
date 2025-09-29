// Stripe payment processing utilities
import Stripe from 'stripe'
import pb from './pocketbase'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

// Currency configurations for Stripe
export const SUPPORTED_CURRENCIES = {
  USD: { code: 'usd', symbol: '$', minimum: 1 },
  EUR: { code: 'eur', symbol: '€', minimum: 1 },
  GBP: { code: 'gbp', symbol: '£', minimum: 1 },
  CAD: { code: 'cad', symbol: 'C$', minimum: 1 },
  AUD: { code: 'aud', symbol: 'A$', minimum: 1 },
}

export interface CreatePaymentIntentParams {
  amount: number
  currency: string
  donorId: string
  artistId: string
  donationType: 'one_time' | 'monthly' | 'artwork_purchase'
  message?: string
  isAnonymous: boolean
}

/**
 * Create a Stripe PaymentIntent for a donation
 */
export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  try {
    const currency = params.currency.toLowerCase()
    const currencyConfig = SUPPORTED_CURRENCIES[currency.toUpperCase() as keyof typeof SUPPORTED_CURRENCIES]

    if (!currencyConfig) {
      throw new Error(`Unsupported currency: ${currency}`)
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(params.amount * 100)

    if (amountInCents < currencyConfig.minimum * 100) {
      throw new Error(`Minimum donation amount is ${currencyConfig.symbol}${currencyConfig.minimum}`)
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currencyConfig.code,
      metadata: {
        donorId: params.donorId,
        artistId: params.artistId,
        donationType: params.donationType,
        message: params.message || '',
        isAnonymous: params.isAnonymous.toString(),
      },
      description: `Donation to artist ${params.artistId}`,
      // Enable automatic payment methods for web
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      currency: currencyConfig.code,
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

/**
 * Confirm a payment intent after successful payment
 */
export async function confirmPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Error confirming payment:', error)
    throw error
  }
}

/**
 * Process webhook event from Stripe
 */
export async function processWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(failedPaymentIntent)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook event:', error)
    throw error
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const metadata = paymentIntent.metadata

    // Calculate platform fee (5%)
    const amount = paymentIntent.amount / 100 // Convert from cents
    const platformFee = amount * 0.05
    const netAmount = amount - platformFee

    // Create donation record
    await pb.collection('donations').create({
      donor: metadata.donorId,
      artist: metadata.artistId,
      amount: amount,
      currency: paymentIntent.currency.toUpperCase(),
      donation_type: metadata.donationType,
      message: metadata.message,
      is_anonymous: metadata.isAnonymous === 'true',
      payment_method: 'card',
      stripe_payment_intent_id: paymentIntent.id,
      status: 'completed',
      platform_fee: platformFee,
      net_amount: netAmount,
      processed_at: new Date().toISOString(),
      is_recurring: metadata.donationType === 'monthly'
    })

    // If this is a monthly donation, create subscription record
    if (metadata.donationType === 'monthly') {
      // Create a subscription record in PocketBase
      await pb.collection('subscriptions').create({
        donor: metadata.donorId,
        artist: metadata.artistId,
        amount: amount,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'active',
        stripe_payment_intent_id: paymentIntent.id,
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      })
    }

    console.log('Payment processed successfully:', paymentIntent.id)
  } catch (error) {
    console.error('Error handling payment success:', error)
    throw error
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const metadata = paymentIntent.metadata

    // Create donation record with failed status
    await pb.collection('donations').create({
      donor: metadata.donorId,
      artist: metadata.artistId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      donation_type: metadata.donationType,
      message: metadata.message,
      is_anonymous: metadata.isAnonymous === 'true',
      payment_method: 'card',
      stripe_payment_intent_id: paymentIntent.id,
      status: 'failed',
      platform_fee: 0,
      net_amount: 0,
      processed_at: new Date().toISOString(),
    })

    console.log('Payment failure recorded:', paymentIntent.id)
  } catch (error) {
    console.error('Error handling payment failure:', error)
    throw error
  }
}

/**
 * Get payment methods for a customer
 */
export async function getPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })
    return paymentMethods.data
  } catch (error) {
    console.error('Error getting payment methods:', error)
    throw error
  }
}

export { stripe }
