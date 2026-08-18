# API Conventions

## API Prefix
All routes must use `/api/v1`.

## Responses
Standard Success Response:
```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

Standard Error Response:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```
