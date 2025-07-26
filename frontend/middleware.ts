import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que precisam de autenticação
const protectedRoutes = ['/dashboard', '/accounts', '/transactions', '/categories'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verifica se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Se for uma rota protegida, verifica se tem token
  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value;
    
    // Se não tem token, redireciona para login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Se estiver logado e tentar acessar login, redireciona para dashboard
  if (pathname === '/login') {
    const token = request.cookies.get('token')?.value;
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configuração do matcher - define quais rotas o middleware deve interceptar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
