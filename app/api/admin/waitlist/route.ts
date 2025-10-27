// app/api/admin/waitlist/route.ts

import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase-server"

export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const waitlist = await prisma.waitlist.findMany({
			orderBy: { createdAt: "asc" },
		})

		return NextResponse.json({ waitlist })
	} catch (error) {
		console.error("Waitlist fetch error:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}
