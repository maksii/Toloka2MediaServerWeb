from flask import Flask
from flask_login import LoginManager
from flask_principal import Principal, Permission, RoleNeed
from flask_bcrypt import Bcrypt
import os

from app.services.config_service import init_web_settings, read_releases_ini_and_sync_to_db, read_settings_ini_and_sync_to_db
from .models.base import db  # Importing db from base model
from .models.user import bcrypt  # Importing bcrypt instance

def create_app():
    app = Flask(__name__)
    # Fetch the secret key from environment variable
    app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'default_secret_key')
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'toloka2web.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'

    db.init_app(app)
    bcrypt.init_app(app)  # Initializing Bcrypt with the app

    from .models.user import User
    from .models.user_settings import UserSettings
    from .models.releases import Releases
    from .models.application_settings import ApplicationSettings
    
    with app.app_context():
        db.create_all()  # Ensure all tables are created
        # Optional: Check if initial data needs to be added
        
        if not ApplicationSettings.query.first():
            app_config_path='data/app.ini'
            read_settings_ini_and_sync_to_db(app_config_path)
            init_web_settings()
            pass
        if not Releases.query.first():
            title_config_path='data/titles.ini'
            read_releases_ini_and_sync_to_db(title_config_path)
            pass

    login_manager = LoginManager(app)
    login_manager.login_view = 'login'
    principals = Principal(app)

    admin_permission = Permission(RoleNeed('admin'))
    user_permission = Permission(RoleNeed('user'))

    from .routes.routes import configure_routes
    from .routes.anime import anime_bp
    from .routes.release import release_bp
    from .routes.stream import stream_bp
    from .routes.studio import studio_bp
    from .routes.toloka import toloka_bp
    from .routes.mal import mal_bp
    from .routes.tmdb import tmdb_bp
    from .routes.settings import setting_bp
    
    app.register_blueprint(anime_bp)
    app.register_blueprint(release_bp)
    app.register_blueprint(stream_bp)
    app.register_blueprint(studio_bp)
    app.register_blueprint(toloka_bp)
    app.register_blueprint(mal_bp)
    app.register_blueprint(tmdb_bp)
    app.register_blueprint(setting_bp)

    configure_routes(app, login_manager, admin_permission, user_permission)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)