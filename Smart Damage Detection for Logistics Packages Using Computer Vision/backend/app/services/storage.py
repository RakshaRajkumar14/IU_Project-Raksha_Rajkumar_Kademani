# backend/app/services/storage.py
import os
import boto3
from botocore.exceptions import BotoCoreError, ClientError

S3_BUCKET = os.getenv("S3_BUCKET")

def upload_bytes_to_s3(key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    """
    Upload bytes to S3 and return public URL (if bucket policy allows) or s3://key.
    """
    if not S3_BUCKET:
        raise RuntimeError("S3_BUCKET not configured")
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
    try:
        s3.put_object(Bucket=S3_BUCKET, Key=key, Body=data, ContentType=content_type)
        # You can build an HTTPS URL if bucket is public or uses CloudFront. Safer: return s3://
        return f"s3://{S3_BUCKET}/{key}"
    except (BotoCoreError, ClientError) as e:
        raise
