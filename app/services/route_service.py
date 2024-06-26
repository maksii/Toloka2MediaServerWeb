import datetime
import os
from flask import request, jsonify, abort, g
from functools import wraps
from flask_login import current_user

def login_or_api_key_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if user is logged in
        if not current_user.is_authenticated:
            # If not logged in, check for API key
            api_key = request.headers.get('x-api-key')
            # Fetch the valid API key from environment variable
            valid_api_key = os.environ.get('API_KEY', 'your_api_key_here')  # default can be replaced or removed

            if not api_key or api_key != valid_api_key:
                abort(403, description="Access denied: No valid API key or login session")
        return f(*args, **kwargs)
    return decorated_function

import pkg_resources

def get_installed_packages():
    packages = {}
    for dist in pkg_resources.working_set: # Filter to include only packages installed from GitHub
        packages[dist.project_name] = dist.version
    return packages

def list_files(path):
    # Check if the path is valid and is a directory
    if not os.path.isdir(path):
        return jsonify({'error': 'Invalid directory path'}), 400

    # List all files in the directory and their details
    try:
        files = []
        for filename in os.listdir(path):
            file_path = os.path.join(path, filename)
            if os.path.isfile(file_path):
                file_info = os.stat(file_path)
                files.append({
                    'name': filename,
                    'size_mb': round(file_info.st_size / (1024 * 1024), 2),  # Convert size to MB and round to 2 decimal places
                    'last_modified': datetime.fromtimestamp(file_info.st_mtime).strftime('%Y-%m-%d %H:%M:%S')  # Format the date
                })
        return jsonify({'files': files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500