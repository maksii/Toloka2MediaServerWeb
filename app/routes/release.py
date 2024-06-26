from flask import Blueprint, jsonify, request, make_response
from flask_login import login_required
import jsonpickle

from app.services.route_service import login_or_api_key_required
from app.services.services import add_release_logic, get_releases_torrent_status, get_titles_logic, update_all_releases_logic, update_release_logic
from app.services.config_service import edit_release as edit_release_db, delete_release as delete_release_db, sync_settings

release_bp = Blueprint('release', __name__)

@release_bp.route('/api/releases', methods=['GET'])
@login_required
def get_titles():
    try:
        titles_data = get_titles_logic()
        torrents_data = get_releases_torrent_status()

        # Convert the list of torrents into a dictionary for easier access
        torrents_dict = {torrent['hash']: torrent for torrent in torrents_data.data if isinstance(torrent, dict)}

        # Extend each title with torrent info
        for title, data in titles_data.items():
            hash_value = data.get('hash')
            if hash_value in torrents_dict:
                # Only select relevant torrent info to add
                torrent_info = {
                    "state": torrents_dict[hash_value].get("state"),
                    "progress": torrents_dict[hash_value].get("progress"),
                    "name": torrents_dict[hash_value].get("name"),
                }
                data['torrent_info'] = torrent_info

        return jsonify(titles_data)
    except Exception as e:
        # Return a custom JSON error message with a 500 Internal Server Error status
        error_message = {
            "error": "titles.ini or other configuration not valid, please check your configs",
            "details": str(e)
        }
        return make_response(jsonify(error_message), 500)

@release_bp.route('/api/releases', methods=['POST'])
@login_required
def add_release():
    response = add_release_logic(request.form)
    sync_settings("release", "from")
    return jsonify(response)

@release_bp.route('/api/releases/update', methods=['POST'])
@login_or_api_key_required 
def update_release():
    if request.form:
        response = update_release_logic(request.form)
    else:
        response = update_all_releases_logic()
    sync_settings("release", "from")
    return jsonify(response)

@release_bp.route('/api/releases/torrents', methods=['GET'])
@login_or_api_key_required 
def torrent_info_all_releases():
    return jsonpickle.encode(get_releases_torrent_status(), unpicklable=False)

@release_bp.route('/api/releases/<string:hash>', methods=['GET'])
@login_or_api_key_required 
def recieve_request_from_client(hash):
    print(hash)
    #TBD entry point to start automatic actions on torrent completion
    return make_response(jsonify({"msg": f"{hash}"}), 200)

@release_bp.route('/api/releases', methods=['PUT'])
@login_required
def edit_release():
    try:
        response = edit_release_db(request.form)
    except Exception as e:
        error_message = {
            "error": "Error during releases manipulation",
            "details": str(e)
        }
        return make_response(jsonify(error_message), 500)

    return make_response(jsonify({"msg": response}), 200)

@release_bp.route('/api/releases', methods=['DELETE'])
@login_required
def delete_release():
    try:
        response = delete_release_db(request.form)
    except Exception as e:
        error_message = {
            "error": "Error during releases manipulation",
            "details": str(e)
        }
        return make_response(jsonify(error_message), 500)

    return make_response(jsonify({"msg": response}), 200)