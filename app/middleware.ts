import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {jwtVerify} from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request: NextRequest) {

    const token = request.cookies.get('token')?.value
    const {pathname} = request.nextUrl
    let isTokenValid = false

    if (token) {
        try {
            await jwtVerify(token, secret)
            isTokenValid = true
        } catch (error) {
            const response = NextResponse.redirect(new URL('/', request.url))
            response.cookies.delete('token')
            return response
        }
    }

    if ((pathname.startsWith("/dashboard") || pathname.startsWith("/market")) && !isTokenValid) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (pathname === '/' && isTokenValid) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/market/:path*", "/"]
}