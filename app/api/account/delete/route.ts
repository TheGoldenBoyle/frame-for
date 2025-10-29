import { NextResponse } from "next/server"
import { createClient } from "@/lib/superbase-server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
})

export async function POST() {
    try {
        const supabase = await createClient()
        
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }
        
        // Get user data from database
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                stripeSubscriptionId: true,
                stripeCustomerId: true,
            }
        })
        
        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }
        
        // Cancel Stripe subscription if exists
        if (dbUser.stripeSubscriptionId) {
            try {
                await stripe.subscriptions.cancel(dbUser.stripeSubscriptionId)
                console.log(`Cancelled subscription: ${dbUser.stripeSubscriptionId}`)
            } catch (stripeError) {
                console.error("Failed to cancel Stripe subscription:", stripeError)
                // Continue with deletion even if Stripe cancellation fails
            }
        }
        
        // Delete user from database (cascades to all related records)
        await prisma.user.delete({
            where: { id: user.id }
        })
        
        // Delete user from Supabase Auth
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
            console.error("Failed to delete user from Supabase:", deleteError)
            // User is already deleted from DB, so we'll consider this a success
        }
        
        // Sign out the user
        await supabase.auth.signOut()
        
        return NextResponse.json({ 
            success: true,
            message: "Account deleted successfully"
        })
    } catch (error) {
        console.error("Delete account error:", error)
        return NextResponse.json(
            { error: "Failed to delete account" },
            { status: 500 }
        )
    }
}