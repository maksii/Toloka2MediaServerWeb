# routes.py

from flask import Response, current_app, flash, redirect, request, render_template, url_for, get_flashed_messages
from flask_login import current_user, login_required, login_user, logout_user
from flask_principal import Permission, UserNeed, RoleNeed, identity_changed, Identity, AnonymousIdentity, identity_loaded

from app.models.application_settings import ApplicationSettings
from app.models.login_form import LoginForm
from app.models.registration_form import RegistrationForm
from app.models.user import User
from app.app import db 

from ..services.services import (
    multi_search,
    proxy_image_logic
)

def configure_routes(app, login_manager, admin_permission, user_permission):
    @app.route('/')
    @login_required
    def index():
        return render_template('index.html')

    @app.route('/settings')
    @admin_permission.require(http_exception=403)
    def settings():
        return render_template('settings.html')

    @app.route('/image/')
    def proxy_image():
        url = request.args.get('url')
        return proxy_image_logic(url)
    
    @app.route('/api/search')
    @login_required
    def search_aggregated():
        query = request.args.get('query')
        return multi_search(query)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        form = LoginForm()
        if form.validate_on_submit():
            try:
                username = form.username.data
                password = form.password.data
                remember = form.remember_me.data
                user = User.query.filter_by(username=username).first()
                if user and user.check_password(password):
                    login_user(user, remember=remember)
                    identity_changed.send(current_app._get_current_object(), identity=Identity(user.id))
                    return redirect(url_for('index'))
                else:
                    flash('Invalid username or password', 'error')
            except Exception as e:
                flash('Login failed due to an unexpected error', 'error')
        return render_template('login.html', form=form)
    
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        form = RegistrationForm()
        open_registration = ApplicationSettings.query.filter_by(key='open_registration').first()
        if getattr(open_registration, 'value', None) and open_registration.value.lower() == 'true':
            if form.validate_on_submit():
                user = User(username=form.username.data)
                user.set_password(form.password.data)
                # Check if this is the first user
                if User.query.count() == 0:
                    user.roles = 'admin'
                else:
                    user.roles = 'user'
                db.session.add(user)
                db.session.commit()
                flash('Account registered', 'info')
                return redirect(url_for('login'))
        else:
            flash('Registration is closed or not set.', 'error')
        return render_template('register.html', form=form)

    @app.route('/logout')
    @login_required 
    def logout():
        logout_user()
        identity_changed.send(app, identity=AnonymousIdentity()) 
        flash('You have been logged out.', 'info')
        return redirect(url_for('login')) 

    @identity_loaded.connect_via(app)
    def on_identity_loaded(sender, identity):
        # Set the identity user object
        identity.user = current_user
    
        # Add the UserNeed to the identity
        if hasattr(current_user, 'id'):
            identity.provides.add(UserNeed(current_user.id))
    
        # Assuming the User model has a list of roles, update the identity with the roles that the user provides
        if hasattr(current_user, 'roles'):
            identity.provides.add(RoleNeed(current_user.roles))
    
    #As user can use remember me, just a hacki fix to be sure, that hi identity updated before each request
    #require some testing overtime to see if it will change behavior
    @app.before_request
    def before_request():
        if current_user.is_authenticated:
            identity_changed.send(current_app._get_current_object(), identity=Identity(current_user.id))
            
    @app.route('/static/js/common/user.js')
    def user_script():
        if current_user.is_authenticated:
            user_id = current_user.id if current_user.id else "undefined"
            # Ensure roles is a string and default to an empty string if none
            user_roles = current_user.roles if current_user.roles else ""
        else:
            user_id = "undefined"
            user_roles = ""
    
        js_content = f"""
        const user = {{
            id: "{user_id}",
            roles: "{user_roles}"
        }};
        export default user;
        """
    
        return Response(js_content, mimetype='application/javascript')