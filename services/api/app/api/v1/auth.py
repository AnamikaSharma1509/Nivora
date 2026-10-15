from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.services.auth_service import AuthService
from app.schemas.auth import (
    UserRegisterRequest, UserLoginRequest, TokenResponse,
    UserProfileResponse, UserPreferencesSchema, PasswordResetRequest, PasswordResetConfirm,
    GoogleAuthCallbackRequest
)
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegisterRequest, response: Response, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.register_user(data)
    _, access_token, refresh_token = service.authenticate_user(
        UserLoginRequest(email=data.email, password=data.password)
    )
    # Set HttpOnly refresh cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in HTTPS production
        max_age=30 * 86400
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        display_name=user.display_name,
        is_new_user=True,
        has_completed_onboarding=False,
    )

@router.post("/login", response_model=TokenResponse)
def login(data: UserLoginRequest, response: Response, db: Session = Depends(get_db)):
    service = AuthService(db)
    user, access_token, refresh_token = service.authenticate_user(data)
    has_completed = service.has_completed_onboarding(user.id)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=30 * 86400
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        display_name=user.display_name,
        is_new_user=False,
        has_completed_onboarding=has_completed,
    )

@router.get("/google/url")
def get_google_auth_url():
    configured = bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)
    if configured:
        redirect_uri = settings.GOOGLE_REDIRECT_URI
        url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={settings.GOOGLE_CLIENT_ID}&"
            f"redirect_uri={redirect_uri}&"
            f"response_type=code&"
            f"scope=openid%20email%20profile&"
            f"access_type=offline&prompt=consent"
        )
    else:
        url = None
    
    return {
        "url": url,
        "configured": configured,
        "client_id": settings.GOOGLE_CLIENT_ID
    }

@router.post("/google/callback", response_model=TokenResponse)
def google_callback(
    data: GoogleAuthCallbackRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    service = AuthService(db)

    # 1. Reject if Google OAuth is not configured on the server
    if not (settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google login."
        )

    # 2. Reject if neither code nor credential token is provided
    if not data.code and not data.credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Google authorization code or credential token."
        )

    email = None
    display_name = None
    google_id = None

    if data.code:
        # Real Google OAuth token exchange
        import urllib.request
        import urllib.parse
        import json
        try:
            token_url = "https://oauth2.googleapis.com/token"
            post_data = urllib.parse.urlencode({
                "code": data.code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            }).encode("utf-8")
            req = urllib.request.Request(
                token_url,
                data=post_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                token_json = json.loads(resp.read().decode("utf-8"))
                access_token_val = token_json.get("access_token")
                
                # Fetch profile from userinfo
                userinfo_req = urllib.request.Request(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {access_token_val}"}
                )
                with urllib.request.urlopen(userinfo_req, timeout=10) as uresp:
                    user_data = json.loads(uresp.read().decode("utf-8"))
                    email = user_data.get("email")
                    display_name = user_data.get("name")
                    google_id = user_data.get("sub")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google OAuth authorization exchange failed: {str(e)}"
            )
    elif data.credential:
        # ID token / Credential token extraction
        import json
        import base64
        try:
            parts = data.credential.split(".")
            if len(parts) >= 2:
                padding = "=" * (4 - len(parts[1]) % 4)
                payload_str = base64.urlsafe_b64decode(parts[1] + padding).decode("utf-8")
                payload = json.loads(payload_str)
                email = payload.get("email")
                display_name = payload.get("name")
                google_id = payload.get("sub")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid Google credential token: {str(e)}"
            )

    if not email or not google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not retrieve verified email or identity from Google authorization."
        )

    user, access_token, refresh_token, is_new_user = service.authenticate_or_create_google_user(
        google_id=google_id,
        email=email,
        display_name=display_name or email.split("@")[0]
    )

    has_completed = service.has_completed_onboarding(user.id)
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=30 * 86400
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        display_name=user.display_name,
        is_new_user=is_new_user,
        has_completed_onboarding=has_completed,
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/preferences", response_model=UserPreferencesSchema)
def update_preferences(
    prefs: UserPreferencesSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AuthService(db)
    updated = service.update_preferences(current_user.id, prefs)
    return updated

@router.delete("/me")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AuthService(db)
    service.delete_account(current_user.id)
    return {"message": "Account deleted successfully"}
