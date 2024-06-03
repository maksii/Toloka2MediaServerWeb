import logging
from flask import Flask, jsonify, request, render_template, session, Response
import requests

import toloka2MediaServer
import toloka2MediaServer.config_parser


app_config, titles_config, application_config = toloka2MediaServer.config_parser.load_configurations(
        app_config_path='data/app.ini',
        title_config_path='data/titles.ini'
    )

config = toloka2MediaServer.model.Config(
    toloka=toloka2MediaServer.config_parser.get_toloka_client(application_config),
    app_config=app_config,
    titles_config=titles_config,
    application_config=application_config
)

config.client = toloka2MediaServer.config_parser.dynamic_client_init(config)

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Set this to a strong secret value

logger = logging.basicConfig(
    filename='toloka2MediaServer/data/app_web.log',  # Name of the file where logs will be written
    filemode='a',  # Append mode, which will append the logs to the file if it exists
    format='%(asctime)s - %(levelname)s - %(message)s',  # Format of the log messages
    level=logging.DEBUG #log level from config
)
class RequestData:
    url: str = ""
    season: int = 0
    index: int = 0
    correction: int = 0
    title: str = ""
    codename: str = ""
    force: bool = False
    def __init__(self, url = "", season = 0, index = 0, correction = 0, title = "", codename = "", force=False):
        self.url = url
        self.season = season
        self.index = index
        self.correction = correction
        self.title = title
        self.codename = codename
        self.force = force


@app.route('/', methods=['GET'])
def index():
    titles = toloka2MediaServer.config.update_titles()
    # Creating a list of dictionaries, each containing the data for the selected keys
    data = []
    codenames =[]
    keys = ['torrent_name', 'publish_date', 'guid']
    for section in titles.sections():
        codenames.append(section)
        section_data = {'codename': section}
        for key in keys:
            section_data[key] = titles.get(section, key)
        data.append(section_data)

    # Define column headers and rename them
    columns = {
        'codename': 'Codename',
        'torrent_name': 'Name',
        'publish_date': 'Last Updated',
        'guid': 'URL'
    }
    output = session.pop('output', {})   
    return render_template('index.html', data=data, columns=columns, codenames=codenames, output=output)

@app.route('/get_titles', methods=['GET'])
def get_titles():
    titles = toloka2MediaServer.config.update_titles()
    
    # Extract sections from the ConfigParser object
    sections = {}
    for section in titles.sections():
        options = {}
        for option in titles.options(section):
            options[option] = titles.get(section, option)
        sections[section] = options

    # Convert the sections data to JSON format
    response = jsonify(sections)

    # Return the JSON response
    return response

@app.route('/get_torrents', methods=['GET'])
def get_torrents():
    # Extract the search parameter from the URL query string
    search_query = request.args.get('query', default=None, type=str)
    
    if search_query:
        # Convert data to JSON format
        torrents = toloka2MediaServer.main_logic.search_torrents(search_query, logger)
        response = jsonify(torrents)

        # Return the JSON response
        return response, 200
    else:
        return []

@app.route('/get_torrent', methods=['GET'])
def get_torrent():
    # Extract the search parameter from the URL query string
    id = request.args.get('id', default=None, type=str)
    
    if id:
        # Convert data to JSON format
        torrent = toloka2MediaServer.main_logic.get_torrent(id, logger)
        response = jsonify(torrent)

        # Return the JSON response
        return response, 200
    else:
        return []

@app.route('/add_torrent', methods=['GET'])
def add_torrent():
    # Extract the search parameter from the URL query string
    id = request.args.get('id', default=None, type=str)
    
    if id:
        # Convert data to JSON format
        toloka2MediaServer.main_logic.add_torrent(id, logger)
        

        # Return the JSON response
        return [], 200
    else:
        return []

@app.route('/add_release', methods=['POST'])
def add_release():
    # Process the URL to add release
    try:
        requestData = RequestData(
            url = request.form['url'],
            season = request.form['season'],
            index = int(request.form['index']),
            correction = int(request.form['correction']),
            title = request.form['title'],
        )


        #--add --url https://toloka.to/t675888 --season 02 --index 2 --correction 0 --title "Tsukimichi -Moonlit Fantasy-"

        operation_result = toloka2MediaServer.main_logic.add_release_by_url(requestData, logger)
        output = serialize_operation_result(operation_result)
        output = jsonify(output)
        
        return output, 200
    except Exception as e:
        message = f'Error: {str(e)}'
        return jsonify({"error": message}), 200

@app.route('/update_release', methods=['POST'])
def update_release():
    # Process the name to update release
    try:
        requestData = RequestData(
            codename = request.form['codename']
        )
        operation_result = toloka2MediaServer.main_logic.update_release_by_name(requestData, requestData.codename, logger)
        output = serialize_operation_result(operation_result)
        output = jsonify(output)
        
        return output, 200
    except Exception as e:
        message = f'Error: {str(e)}'
        return jsonify({"error": message}), 200

@app.route('/update_all_releases', methods=['POST'])
def update_all_releases():
    # Process to update all releases
    try:
        requestData = RequestData()
        operation_result = toloka2MediaServer.main_logic.update_releases(requestData, logger)
        output = serialize_operation_result(operation_result)
        output = jsonify(output)
        
        return output, 200
    except Exception as e:
        message = f'Error: {str(e)}'
        return jsonify({"error": message}), 200

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

@app.route('/image/')
def proxy_image():
    #Get the full URL from the query parameter
    url = request.args.get('url')
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