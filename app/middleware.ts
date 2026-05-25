import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {jwtVerify} from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request: NextRequest) {

    const token = request.cookies.get('token')?.value
    const {pathname} = request.nextUrl

    if (!token) {
        if (pathname !== '/auth') {
            return NextResponse.redirect(new URL('/auth', request.url))
        }
    } else {
        try {
            await jwtVerify(token, secret)
        } catch (error) {
            return NextResponse.redirect(new URL('/auth', request.url))
        }
    }

    if ((pathname.startsWith("/dashboard") || pathname.startsWith("/market")) && !token) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    if (pathname.startsWith('/auth') && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard", "/market", "/auth"]
}