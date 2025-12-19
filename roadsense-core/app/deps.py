from fastapi import Depends
from app.routers.auth import verify_token

def get_current_user(token=verify_token):
    return token
