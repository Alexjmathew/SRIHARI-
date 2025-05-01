from flask import Blueprint, render_template, jsonify, request
from flask_login import login_required, current_user
from bson import ObjectId

map_bp = Blueprint('map', __name__)

@map_bp.route('/')
@login_required
def index():
    return render_template('index.html')

@map_bp.route('/api/landmarks', methods=['GET', 'POST'])
@login_required
def landmarks():
    if request.method == 'POST':
        data = request.get_json()
        landmark = {
            'name': data['name'],
            'description': data['description'],
            'coordinates': data['coordinates'],
            'type': data['type'],
            'created_by': ObjectId(current_user.id),
            'created_at': datetime.utcnow(),
            'modified_at': datetime.utcnow(),
            'tags': data.get('tags', []),
            'image_path': data.get('image_path', '')
        }
        mongo.db.landmarks.insert_one(landmark)
        return jsonify({'status': 'success'})
    
    landmarks = list(mongo.db.landmarks.find())
    return jsonify(landmarks)

@map_bp.route('/api/landmarks/<landmark_id>', methods=['PUT', 'DELETE'])
@login_required
def landmark(landmark_id):
    landmark = mongo.db.landmarks.find_one({'_id': ObjectId(landmark_id)})
    
    if not landmark:
        return jsonify({'status': 'error', 'message': 'Landmark not found'}), 404
    
    # Check permissions
    if current_user.role != 'admin' and landmark['created_by'] != ObjectId(current_user.id):
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403
    
    if request.method == 'PUT':
        data = request.get_json()
        updates = {
            'name': data.get('name', landmark['name']),
            'description': data.get('description', landmark['description']),
            'coordinates': data.get('coordinates', landmark['coordinates']),
            'type': data.get('type', landmark['type']),
            'modified_at': datetime.utcnow(),
            'tags': data.get('tags', landmark['tags'])
        }
        mongo.db.landmarks.update_one({'_id': ObjectId(landmark_id)}, {'$set': updates})
        return jsonify({'status': 'success'})
    
    elif request.method == 'DELETE':
        mongo.db.landmarks.delete_one({'_id': ObjectId(landmark_id)})
        return jsonify({'status': 'success'})
