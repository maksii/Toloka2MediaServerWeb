from flask import Blueprint, jsonify, request
import jsonpickle

from app.services.services import add_title_from_streaming_site, get_streaming_site_release_details, search_titles_from_streaming_site


stream_bp = Blueprint('stream', __name__)

@stream_bp.route('/api/stream', methods=['GET'])
def search_titles_from_streaming():
    query = request.args.get('query')
    return jsonpickle.encode(search_titles_from_streaming_site(query), unpicklable=False)

@stream_bp.route('/api/stream', methods=['POST'])
def add_title_from_streaming():
    data = request.get_json()
    return jsonify(add_title_from_streaming_site(data))

@stream_bp.route('/api/stream/details', methods=['POST'])
def get_title_details():
    data = request.get_json()
    response = get_streaming_site_release_details(data['provider'], data['link'])
    return jsonpickle.encode(response, unpicklable=False)