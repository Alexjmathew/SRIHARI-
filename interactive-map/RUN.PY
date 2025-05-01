from app import create_app, db
from app.models import User
from flask_migrate import Migrate
import os

app = create_app(os.getenv('FLASK_ENV') or 'default')
migrate = Migrate(app, db)

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
