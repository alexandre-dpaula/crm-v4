import { NextResponse } from 'next/server';
import { HttpError } from '@/lib/errors';

export function jsonResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function handleRouteError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.status }
    );
  }

  console.error('[API_ERROR]', error);
  return NextResponse.json(
    { error: 'Erro inesperado. Tente novamente mais tarde.' },
    { status: 500 }
  );
}
