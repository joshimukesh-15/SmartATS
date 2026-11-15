import os
import aiofiles
from fastapi import UploadFile, HTTPException
from app.core.config import settings
from app.core.security import sanitize_filename, validate_file_extension


async def save_upload_file(upload_file: UploadFile) -> str:
    """
    Validates and saves an uploaded file to the configured storage directory.
    Returns the absolute path of the saved file.
    """
    # 1. Validate file extension
    valid_ext, err_msg = validate_file_extension(upload_file.filename)
    if not valid_ext:
        raise HTTPException(status_code=400, detail=err_msg)

    # 2. Sanitize filename
    safe_name = sanitize_filename(upload_file.filename)
    destination_path = os.path.join(settings.UPLOAD_DIR, safe_name)

    # 3. Stream content and enforce size limits
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    total_bytes = 0

    async with aiofiles.open(destination_path, "wb") as out_file:
        while content := await upload_file.read(1024 * 64):
            total_bytes += len(content)
            if total_bytes > max_bytes:
                # Clean up partially written file
                try:
                    os.remove(destination_path)
                except OSError:
                    pass
                raise HTTPException(
                    status_code=413,
                    detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
                )
            await out_file.write(content)

    return destination_path
