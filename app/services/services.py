# services.py

from flask import Response, json, jsonify
import requests

from types import SimpleNamespace

from toloka2MediaServer.config_parser import load_configurations, get_toloka_client
from toloka2MediaServer.clients.dynamic import dynamic_client_init
from toloka2MediaServer.models.config import Config
from toloka2MediaServer.logger_setup import setup_logging
from toloka2MediaServer.main_logic import (
    add_release_by_url, update_release_by_name, update_releases,
    search_torrents, get_torrent as get_torrent_external,
    add_torrent as add_torrent_external
)
from stream2mediaserver.main_logic import search_releases as search_releases_stream, get_release_details as get_release_details_stream
import urllib3

from app.models.request_data import RequestData
from app.services.mal_service import search_anime
from app.services.services_db import get_anime_by_name
from app.services.tmdb_service import get_media_detail, search_media

def initiate_config():
    app_config_path='data/app.ini'
    title_config_path='data/titles.ini'
    logger_path = 'data/app_web.log'

    app_config, titles_config, application_config = load_configurations(app_config_path,title_config_path)
    toloka=get_toloka_client(application_config)
    logger=setup_logging(logger_path)

    config = Config(
        logger=logger,
        toloka=toloka,
        app_config=app_config,
        titles_config=titles_config,
        application_config=application_config
    )

    client = dynamic_client_init(config)
    config.client = client
    
    return config

def initiate_min_config():
    app_config_path='data/app.ini'
    title_config_path='data/titles.ini'
    logger_path = 'data/app_web.log'

    app_config, titles_config, application_config = load_configurations(app_config_path,title_config_path)
    logger=setup_logging(logger_path)

    config = Config(
        logger=logger,
        app_config=app_config,
        titles_config=titles_config,
        application_config=application_config
    )
    
    return config

def get_titles_logic():
    config = initiate_min_config()
    sections = {}
    for section in config.titles_config.sections():
        options = {}
        for option in config.titles_config.options(section):
            options[option] = config.titles_config.get(section, option)
        sections[section] = options
    return sections

def get_torrents_logic(query):
    if query:
        config = initiate_config()
        config.args = query
        search_result = search_torrents(config)
        return search_result.response
    else:
        return {}
    
def get_torrent_logic(id):
    if id:
        config = initiate_config()
        config.args = id
        search_result = get_torrent_external(config)
        return search_result.response
    else:
        return {}

def add_torrent_logic(request):
    if request:
        
        # Decode byte string to string and parse as JSON
        data = json.loads(request.data.decode('utf-8'))

        # Extract the torrent_url
        torrent_url = data.get('torrent_url', None)
        
        config = initiate_config()
        config.args = RequestData(
            url = torrent_url
        ) 
        output = add_torrent_external(config)
        output = serialize_operation_result(output)
        return output
    else:
        return {}
    
def add_release_logic(request):
    # Process the URL to add release
    try:
        config = initiate_config()
        requestData = RequestData(
            url = request['url'],
            season = request['season'],
            index = int(request['index']),
            correction = int(request['correction']),
            title = request['title'],
        )


        #--add --url https://toloka.to/t675888 --season 02 --index 2 --correction 0 --title "Tsukimichi -Moonlit Fantasy-"
        config.args = requestData
        operation_result = add_release_by_url(config)
        output = serialize_operation_result(operation_result)
        return output
    except Exception as e:
        message = f'Error: {str(e)}'
        return f'{"error": {message}}'
    
def update_release_logic(request):
    # Process the name to update release
    try:
        config = initiate_config()
        requestData = RequestData(
            codename = request['codename']
        )
        config.args = requestData
        operation_result = update_release_by_name(config)
        output = serialize_operation_result(operation_result)
        
        return output
    except Exception as e:
        message = f'Error: {str(e)}'
        return f'{"error": {message}}'

def update_all_releases_logic():
    # Process to update all releases
    try:
        config = initiate_config()
        requestData = RequestData()
        config.args = requestData
        operation_result = update_releases(config)
        output = serialize_operation_result(operation_result)
        
        return output
    except Exception as e:
        message = f'Error: {str(e)}'
        return f'{"error": {message}}'

def serialize_operation_result(operation_result):
    return {
        "operation_type": operation_result.operation_type.name if operation_result.operation_type else None,
        "torrent_references": [str(torrent) for torrent in operation_result.torrent_references],
        "titles_references": [str(titles) for titles in operation_result.titles_references],    
        "status_message": operation_result.status_message,
        "response_code": operation_result.response_code.name if operation_result.response_code else None,
        "operation_logs": operation_result.operation_logs,
        "start_time": operation_result.start_time.isoformat() if operation_result.start_time else None,
        "end_time": operation_result.end_time.isoformat() if operation_result.end_time else None
    }
# Additional functions for other endpoints would be added here...

def proxy_image_logic(url):
    if not url:
        return "No URL provided", 400

    # Normalize the URL
    if url.startswith('//'):
        url = 'https:' + url  # Assume https if protocol is missing
    elif not url.startswith(('http://', 'https://')):
        url = 'https://' + url  # Assume https if only hostname is provided
        
    # Send a GET request to the image URL
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    }
    response = requests.get(url, headers=headers, stream=True)

    # Check if the request was successful
    if response.status_code != 200:
        return "Failed to fetch image", response.status_code

    # Stream the response content directly to the client
    return Response(response.iter_content(chunk_size=1024), content_type=response.headers['Content-Type'])
    pass

# Placeholder functions for new endpoints
def search_voice_studio(query):
    # Logic for searching voice studios
    pass

def list_voice_studios():
    # Logic for listing voice studios
    pass

def list_titles_by_studio(studio_id):
    # Logic for listing titles by a specific studio
    pass

def search_titles_from_streaming_site(query):
    if query:
        config = initiate_config()
        config.args = SimpleNamespace(query=query)
        search_result = search_releases_stream(config)
        
        return search_result
    else:
        return {}

def get_streaming_site_release_details(provider_name, release_url):
    search_result = get_release_details_stream(f'{provider_name}_provider', release_url)
    
    return search_result

def add_title_from_streaming_site(data):
    # Logic for adding a title from a streaming site
    pass

def multi_search(query):
    combined_data = []
    
    # Safe fetching function
    def safe_fetch(data, keys, default=''):
        try:
            for key in keys:
                data = data[key]
            return data if data is not None else default
        except (KeyError, TypeError, IndexError):
            return default

    # Fetch data from various sources
    try:
        mal_data = search_anime(query)
    except Exception:
        mal_data = {'data': []}
    
    try:
        tmdb_data = search_media(query)
    except Exception:
        tmdb_data = {'results': []}
    
    try:
        localdb_data = get_anime_by_name(query)
    except Exception:
        localdb_data = []

    # Process MAL data
    for item in mal_data.get('data', [])[:4]:
        alternatives = ' | '.join([
            safe_fetch(item, ['node', 'alternative_titles', 'en']),
            safe_fetch(item, ['node', 'alternative_titles', 'ja']),
            ' | '.join(safe_fetch(item, ['node', 'alternative_titles', 'synonyms'], []))
        ])
        combined_data.append({
            'source': 'MAL',
            'title': safe_fetch(item, ['node', 'title']),
            'id': safe_fetch(item, ['node', 'id']),
            'status': safe_fetch(item, ['node', 'status']),
            'mediaType': safe_fetch(item, ['node', 'media_type']),
            'image': safe_fetch(item, ['node', 'main_picture', 'medium']),
            'description': safe_fetch(item, ['node', 'title']),
            'releaseDate': safe_fetch(item, ['node', 'start_date']),
            'alternative': alternatives
        })

    # Process TMDB data
    for item in tmdb_data.get('results', [])[:4]:
        item_id = item['id']
        media_type = item.get('media_type', 'Unknown')
        try:
            
            details = get_media_detail(item_id, media_type)
        except Exception:
            details = {}

        relevant_countries = ['JP', 'US', 'UA', 'UK']
        source_array = safe_fetch(details, ['alternative_titles', 'results']) or safe_fetch(details, ['alternative_titles', 'titles'])

        alternative_titles = ' | '.join(
            title['title'] for title in source_array if title.get('iso_3166_1') in relevant_countries
        )

        alternative = f"{safe_fetch(item, ['original_name'])} | {alternative_titles}" if 'original_name' in item else alternative_titles
        
        combined_data.append({
            'source': 'TMDB',
            'title': safe_fetch(item, ['name']) if safe_fetch(item, ['name']) != '' else safe_fetch(item, ['title']),
            'id': item_id,
            'status': safe_fetch(details, ['status']) if safe_fetch(details, ['status']) != '' else 'Unknown',
            'mediaType': media_type,
            'image': f"https://image.tmdb.org/t/p/w500{safe_fetch(item, ['poster_path'])}",
            'description': safe_fetch(item, ['overview']),
            'releaseDate': safe_fetch(item, ['first_air_date']) if safe_fetch(item, ['first_air_date']) !='' else safe_fetch(item, ['release_date']),
            'alternative': alternative
        })

    # Process localdb
    for item in localdb_data[:4]:
        combined_data.append({
            'source': 'localdb',
            'title': safe_fetch(item, ['titleUa']),
            'id': item['id'],
            'status': 'Currently Airing' if item.get('status_id') == 2 else 'Finished Airing',
            'mediaType': 'Anime',
            'image': '',
            'description': safe_fetch(item, ['description']),
            'releaseDate': safe_fetch(item, ['releaseDate']),
            'alternative': safe_fetch(item, ['titleEn'])
        })

    return jsonify(combined_data)


def get_releases_torrent_status():
    config = initiate_config()
    category = config.app_config[config.application_config.client]["category"]
    tags = config.app_config[config.application_config.client]["tag"]
    torrent_info = config.client.get_torrent_info(status_filter = 'all', category = category, tags=tags, sort="added_on", reverse=True)
    
    return torrent_info