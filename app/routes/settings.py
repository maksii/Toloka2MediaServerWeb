from flask import Blueprint, jsonify, request
from flask_login import login_required
from flask_principal import Permission, UserNeed, RoleNeed, identity_changed, Identity, AnonymousIdentity, identity_loaded

from app.services.config_service import add_new_setting, read_all_settings_from_db, sync_settings, update_setting
from app.services.route_service import get_installed_packages, list_files


setting_bp = Blueprint('setting', __name__)
admin_permission = Permission(RoleNeed('admin'))

@setting_bp.route('/api/settings', methods=['GET'])
@login_required
@admin_permission.require(http_exception=403)
def list_setting():
    return jsonify(read_all_settings_from_db())

@setting_bp.route('/api/settings', methods=['POST'])
@login_required
@admin_permission.require(http_exception=403)
def add(setting_id):    
    return jsonify(add_new_setting(setting_id, request.form['section'], request.form['key'], request.form['value'] ))

@setting_bp.route('/api/settings/<int:setting_id>', methods=['POST'])
@login_required
@admin_permission.require(http_exception=403)
def update(setting_id):    
    return jsonify(update_setting(setting_id, request.form['section'], request.form['key'], request.form['value'] ))

@setting_bp.route('/api/settings/sync', methods=['POST'])
@login_required
@admin_permission.require(http_exception=403)
def sync():
    direction = request.form['direction']
    type = request.form['type']       
    return jsonify(sync_settings(type, direction))

@setting_bp.route('/api/settings/versions', methods=['GET'])
@login_required
@admin_permission.require(http_exception=403)
def versions():
    packages = get_installed_packages()
    return jsonify(packages)

@setting_bp.route('/api/settings/files', methods=['GET'])
@login_required
@admin_permission.require(http_exception=403)
def check_config_files():
    return list_files("app/data")