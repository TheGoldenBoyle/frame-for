import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { User, Session } from "@supabase/supabase-js"

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function syncUserWithAPI(supabaseUser: User) {
            try {
                await fetch('/api/user/sync', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            } catch (error) {
                console.error("User sync API error:", error)
            }
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            
            if (session?.user) {
                syncUserWithAPI(session.user)
            }
            
            setLoading(false)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            async (_event, session: Session | null) => {
                setUser(session?.user ?? null)
                
                if (session?.user) {
                    await syncUserWithAPI(session.user)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase])

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        
        if (data.user) {
            // Trigger API sync
            await fetch('/api/user/sync', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
        
        return { data, error }
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    return { user, loading, signIn, signOut }
}