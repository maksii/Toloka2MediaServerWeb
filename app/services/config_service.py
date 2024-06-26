
import configparser
import datetime

from app.models.application_settings import ApplicationSettings
from app.models.releases import Releases
from app.models.base import db

def read_all_settings_from_db():
    settings = ApplicationSettings.query.all()
    
    return serialize(settings)

def init_web_settings():
    add_new_setting('toloka2web', 'open_registration', 'True')
    add_new_setting('toloka2web', 'mal_api', '')
    add_new_setting('toloka2web', 'tmdb_api', '')

def add_new_setting(section, key, value):
    new_setting = ApplicationSettings(section=section, key=key, value=value)
    db.session.add(new_setting)
    db.session.commit()
    
    sync_settings("app","to")
    
    
def update_setting(id, section, key, value):
    setting = ApplicationSettings.query.filter_by(id=id).first()
    setting.id = id
    setting.section = section
    setting.key = key
    setting.value = value
    db.session.add(setting)
    db.session.commit()
    
    sync_settings("app", "to")

def delete_setting(id):
    setting = ApplicationSettings.query.filter_by(id=id).first()
    
    if setting:
        db.session.delete(setting)
        db.session.commit()
        
        sync_settings("app", "to")
        return True, "Setting deleted successfully."
    else:
        return False, "Setting not found."

def delete_release(form):
    section = form['codename']
    release = Releases.query.filter_by(section=section).first()
    
    if release:
        db.session.delete(release)
        db.session.commit()
        
        sync_settings("release", "to")
        return True, "Release deleted successfully."
    else:
        return False, "Release not found."

def edit_release(form):
    section = form['codename']
    release = Releases.query.filter_by(section=section).first()
    if not release:
        release = Releases(section=section)
        db.session.add(release)
    
    release.episode_index = int(form['episode_index'])
    release.season_number = form['season_number']
    release.ext_name = form['ext_name']
    release.torrent_name = form['torrent_name']
    release.download_dir = form['download_dir']
    release.publish_date = datetime.datetime.strptime(form['publish_date'], '%y-%m-%d %H:%M')
    release.release_group = form['release_group']
    release.meta = form['meta']
    release.hash = form['hash']
    release.adjusted_episode_number = int(form['adjusted_episode_number'])
    release.guid = form['guid']
        
    db.session.commit()
    
    sync_settings("release", "to")
    
def sync_settings(setting_type, direction):
    paths = {
        "app": 'data/app.ini',
        "release": 'data/titles.ini'
    }
    actions = {
        ("app", "to"): load_settings_from_db_and_write_to_ini,
        ("app", "from"): read_settings_ini_and_sync_to_db,
        ("release", "to"): load_releases_from_db_and_write_to_ini,
        ("release", "from"): read_releases_ini_and_sync_to_db,
    }

    action = actions.get((setting_type, direction))
    if action:
        action(paths[setting_type])
            
def load_settings_from_db_and_write_to_ini(file_path):
    """
    Loads all settings from the database and writes them to an INI file.
    """
    settings = ApplicationSettings.query.all()
    config = configparser.ConfigParser()
    
    for setting in settings:
        if setting.section not in config.sections():
            config.add_section(setting.section)
        config.set(setting.section, setting.key, setting.value)
    
    with open(file_path, 'w', encoding='utf-8') as configfile:
        config.write(configfile)

def read_settings_ini_and_sync_to_db(file_path):
    """
    Reads settings from an INI file and synchronizes them to the database.
    """
    config = configparser.ConfigParser()
    config.read(file_path, encoding='utf-8')
    
    for section in config.sections():
        for key, value in config.items(section):
            setting = ApplicationSettings.query.filter_by(section=section, key=key).first()
            if setting:
                setting.value = value
            else:
                new_setting = ApplicationSettings(section=section, key=key, value=value)
                db.session.add(new_setting)
    db.session.commit()

def load_releases_from_db_and_write_to_ini(file_path):
    """
    Loads all release data from the database and writes them to an INI file.
    """
    releases = Releases.query.all()
    config = configparser.ConfigParser()
    
    for release in releases:
        section = release.section
        if section not in config.sections():
            config.add_section(section)
        config.set(section, 'episode_index', str(release.episode_index))
        config.set(section, 'season_number', release.season_number)
        config.set(section, 'ext_name', release.ext_name)
        config.set(section, 'torrent_name', release.torrent_name)
        config.set(section, 'download_dir', release.download_dir)
        config.set(section, 'publish_date', release.publish_date.strftime('%y-%m-%d %H:%M'))
        config.set(section, 'release_group', release.release_group)
        config.set(section, 'meta', release.meta)
        config.set(section, 'hash', release.hash)
        config.set(section, 'adjusted_episode_number', str(release.adjusted_episode_number))
        config.set(section, 'guid', release.guid)
    
    with open(file_path, 'w', encoding='utf-8') as configfile:
        config.write(configfile)

def read_releases_ini_and_sync_to_db(file_path):
    """
    Reads release data from an INI file and synchronizes them to the database.
    """
    config = configparser.ConfigParser()
    config.read(file_path, encoding='utf-8')
    
    for section in config.sections():
        release = Releases.query.filter_by(section=section).first()
        if not release:
            release = Releases(section=section)
            db.session.add(release)
        
        release.episode_index = int(config.get(section, 'episode_index'))
        release.season_number = config.get(section, 'season_number')
        release.ext_name = config.get(section, 'ext_name')
        release.torrent_name = config.get(section, 'torrent_name')
        release.download_dir = config.get(section, 'download_dir')
        release.publish_date = datetime.datetime.strptime(config.get(section, 'publish_date'), '%y-%m-%d %H:%M')
        release.release_group = config.get(section, 'release_group')
        release.meta = config.get(section, 'meta')
        release.hash = config.get(section, 'hash')
        release.adjusted_episode_number = int(config.get(section, 'adjusted_episode_number'))
        release.guid = config.get(section, 'guid')
        
    db.session.commit()
    
    
# Helper function to serialize SQLAlchemy objects to JSON
# TBD copypasse refactor
def serialize(data):
    if isinstance(data, list):
        # Recursively serialize each item in the list
        return [serialize(item) for item in data]
    elif hasattr(data, '__dict__'):
        # Serialize SQLAlchemy model objects
        result = {}
        for column in data.__dict__:
            if not column.startswith('_'):  # Skip private and protected attributes
                attr = getattr(data, column)
                if hasattr(attr, '__dict__') or isinstance(attr, list):
                    # Recursively serialize nested objects or lists
                    result[column] = serialize(attr)
                else:
                    # Serialize simple attributes
                    result[column] = attr
        return result
    else:
        # Return simple data types directly
        return data