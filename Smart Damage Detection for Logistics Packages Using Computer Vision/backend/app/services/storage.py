# backend/services/storage.py
import os
import boto3
from botocore.client import Config

AWS_REGION = os.getenv("AWS_REGION")
S3_BUCKET = os.getenv("S3_BUCKET")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and S3_BUCKET:
    s3_client = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4")
    )
else:
    s3_client = None

def upload_bytes_to_s3(key: str, data: bytes, content_type: str = "image/jpeg") -> str:
    if not s3_client:
        raise RuntimeError("S3 not configured")
    s3_client.put_object(Bucket=S3_BUCKET, Key=key, Body=data, ContentType=content_type)
    # public URL (works if bucket allows public read). For production use presigned URLs.
    return f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"
