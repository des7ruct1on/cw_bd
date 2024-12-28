from fastapi import HTTPException, status

class UserNotFoundHTTP(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    
    def __str__(self):
        return self.detail

class TableNotFoundHTTP(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found."
        )
    
    def __str__(self):
        return self.detail

class ColumnNotFoundHTTP(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Column not found."
        )
    
    def __str__(self):
        return self.detail

class NonUniqueUsernameHTTP(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this username or email already exists."
        )
    
    def __str__(self):
        return self.detail

class UnexpectedErrorHTTP(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred."
        )
    
    def __str__(self):
        return self.detail

class InvalidCredentialsHTTP(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials."
        )
    
    def __str__(self):
        return self.detail

class InvalidTokenHTTP(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid token."
        )
    
    def __str__(self):
        return self.detail

class ExpiredTokenHTTP(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token has expired."
        )

    def __str__(self):
        return self.detail

class ForbiddenAdminAccessHTTP(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission denied."
        )
    
    def __str__(self):
        return self.detail

class BackupNotFoundHTTP(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backup not found."
        )
    
    def __str__(self):
        return self.detail

class NonUniqueBackupNameHTTP(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="Backup with this name already exists."
        )
    
    def __str__(self):
        return self.detail