from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class PawLogicException(Exception):
    """Base exception for PawLogic application."""

    def __init__(self, message: str = "An unexpected error occurred", status_code: int = 500) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(PawLogicException):
    def __init__(self, resource: str = "Resource") -> None:
        super().__init__(message=f"{resource} not found", status_code=404)


class UnauthorizedException(PawLogicException):
    def __init__(self, message: str = "Authentication required") -> None:
        super().__init__(message=message, status_code=401)


class ForbiddenException(PawLogicException):
    def __init__(self, message: str = "Insufficient permissions") -> None:
        super().__init__(message=message, status_code=403)


class ValidationException(PawLogicException):
    def __init__(self, message: str = "Validation error") -> None:
        super().__init__(message=message, status_code=422)


class RateLimitException(PawLogicException):
    def __init__(self, message: str = "Rate limit exceeded") -> None:
        super().__init__(message=message, status_code=429)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(PawLogicException)
    async def pawlogic_exception_handler(request: Request, exc: PawLogicException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message},
        )
