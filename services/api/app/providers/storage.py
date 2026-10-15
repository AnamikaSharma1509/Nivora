import os
import shutil
from typing import Optional
from app.providers.base import BaseStorageAdapter
from app.core.config import settings

class LocalStorageAdapter(BaseStorageAdapter):
    def __init__(self, base_dir: Optional[str] = None, base_url: Optional[str] = None):
        self.base_dir = os.path.abspath(base_dir or settings.LOCAL_STORAGE_DIR)
        self.base_url = base_url or f"{settings.API_URL}/media"
        os.makedirs(self.base_dir, exist_ok=True)

    async def store_file(self, source_path: str, destination_key: str, content_type: str = "application/octet-stream") -> str:
        # Prevent path traversal attacks
        clean_key = destination_key.replace("..", "").lstrip("/").lstrip("\\")
        target_path = os.path.join(self.base_dir, clean_key)
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        
        shutil.copyfile(source_path, target_path)
        return f"{self.base_url}/{clean_key.replace(os.sep, '/')}"

    async def get_url(self, key: str, expires_in_seconds: int = 3600) -> str:
        clean_key = key.replace("..", "").lstrip("/").lstrip("\\")
        return f"{self.base_url}/{clean_key.replace(os.sep, '/')}"


class S3StorageAdapter(BaseStorageAdapter):
    def __init__(self):
        self.bucket = settings.S3_BUCKET_NAME
        self.endpoint_url = settings.S3_ENDPOINT_URL
        self.region = settings.AWS_REGION

    async def store_file(self, source_path: str, destination_key: str, content_type: str = "application/octet-stream") -> str:
        # When AWS credentials configured, upload via boto3 / httpx presigned URL
        # Fallback to local storage if credentials missing
        if not settings.AWS_ACCESS_KEY_ID or settings.AWS_ACCESS_KEY_ID.startswith("placeholder"):
            local = LocalStorageAdapter()
            return await local.store_file(source_path, destination_key, content_type)
            
        import boto3
        session = boto3.session.Session()
        s3_client = session.client(
            service_name="s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            endpoint_url=self.endpoint_url,
            region_name=self.region,
        )
        s3_client.upload_file(
            source_path,
            self.bucket,
            destination_key,
            ExtraArgs={"ContentType": content_type}
        )
        return await self.get_url(destination_key)

    async def get_url(self, key: str, expires_in_seconds: int = 3600) -> str:
        if not settings.AWS_ACCESS_KEY_ID or settings.AWS_ACCESS_KEY_ID.startswith("placeholder"):
            local = LocalStorageAdapter()
            return await local.get_url(key, expires_in_seconds)
            
        import boto3
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            endpoint_url=self.endpoint_url,
            region_name=self.region,
        )
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expires_in_seconds
        )
        return url
