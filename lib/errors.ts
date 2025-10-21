export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Não autorizado.') {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Acesso negado.') {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Recurso não encontrado.') {
    super(404, message);
  }
}

export class ValidationError extends HttpError {
  constructor(details: unknown, message = 'Dados inválidos.') {
    super(422, message, details);
  }
}
