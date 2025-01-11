import os
import logging
from flask import Flask, Blueprint, request, jsonify, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
import google.generativeai as genai
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract
from dotenv import load_dotenv
from datetime import datetime, timedelta
from functools import wraps
import time
import json
from uuid import uuid4
import redis

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configuration
class Config:
    UPLOAD_FOLDER = '/tmp/uploads'  # Use /tmp for Render
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')  # Move to environment variable
    CORS_HEADERS = ['Content-Type', 'Authorization']
    CORS_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:5000',
        os.getenv('FRONTEND_URL', '')
    ]
    MAX_REQUESTS_PER_MINUTE = 30
    CONTEXT_MEMORY_SIZE = 10
    RESPONSE_CACHE_TIME = 300  # 5 minutes
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
    USE_REDIS = os.getenv('USE_REDIS', 'false').lower() == 'true'
    DEBUG = os.getenv('FLASK_ENV') == 'development'
    ADMIN_PIN = os.getenv('ADMIN_PIN', 'A1477')  # Default Admin PIN
    USER_PIN = os.getenv('USER_PIN', 'P1477')   # Default User PIN

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize CORS
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "max_age": 3600,
        "supports_credentials": False
    }
})

# Initialize Gemini model - use only one model
genai.configure(api_key=Config.GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Initialize Redis client only if configured
redis_client = None
if Config.USE_REDIS:
    try:
        redis_client = redis.from_url(Config.REDIS_URL)
    except:
        logger.warning("Redis connection failed, falling back to in-memory storage")

# Global context
current_context = ""

# Utility functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def process_file(file):
    global current_context
    filename = secure_filename(file.filename)
    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
    
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER)
    
    file.save(filepath)
    
    try:
        if filename.lower().endswith('.pdf'):
            reader = PdfReader(filepath)
            text = "\n".join(page.extract_text() for page in reader.pages)
        else:
            # Enhanced image processing
            image = Image.open(filepath)
            # Improve image quality for OCR
            image = image.convert('L')  # Convert to grayscale
            text = pytesseract.image_to_string(
                image,
                config='--psm 1 --oem 3'  # Use more accurate OCR mode
            )
        
        # Clean up the extracted text
        text = ' '.join(text.split())
        current_context = text
        return text
    
    except Exception as e:
        logger.error(f"File processing error: {str(e)}")
        raise
    finally:
        # Clean up uploaded file
        if os.path.exists(filepath):
            os.remove(filepath)

# Update other functions to use the single model
def structured_analysis(text):
    try:
        prompt = f"""Analyze this educational content and provide a detailed, structured response with clear reasoning:
        {text[:1500]}...
        
        Please show your analysis process and format the response as follows:
        INITIAL ASSESSMENT:
        - First impressions
        - Key themes identified
        
        DETAILED ANALYSIS:
        SUMMARY:
        - Key point 1 (with reasoning)
        - Key point 2 (with reasoning)
        
        CONCEPTUAL BREAKDOWN:
        - Core concept 1: Explanation
        - Core concept 2: Explanation
        
        RELATIONSHIPS AND PATTERNS:
        - Pattern 1: Analysis
        - Pattern 2: Analysis
        
        STUDY GUIDE:
        Definitions:
        - Term 1: Comprehensive definition
        - Term 2: Comprehensive definition
        
        Key Examples:
        1. First example (with explanation)
        2. Second example (with explanation)
        
        Review Points:
        - Point 1 (with context)
        - Point 2 (with context)"""
        
        response = model.generate_content(prompt)
        if response.candidates and response.candidates[0].content.parts:
            return response.candidates[0].content.parts[0].text
        return "Error: Unable to generate analysis"
    except Exception as e:
        logger.error(f"Error in analysis: {str(e)}")
        raise

def generate_quiz(text):
    try:
        if isinstance(text, dict):
            text = str(text)
            
        prompt = f"""Create a multiple choice quiz with exactly this format (no introduction text):

Q1. [First question here]
a) [Option]
b) [Option]
c) [Option]
d) [Option]
Answer: [letter]

Q2. [Second question here]
a) [Option]
b) [Option]
c) [Option]
d) [Option]
Answer: [letter]

Content to base questions on:
{text}"""

        response = model.generate_content(prompt)
        if response.candidates and response.candidates[0].content.parts:
            return response.candidates[0].content.parts[0].text.strip()
        return "Error: Unable to generate quiz"
    except Exception as e:
        logger.error(f"Error in quiz generation: {str(e)}")
        raise

def generate_study_guide(text):
    try:
        prompt = f"""Based on this content, create a detailed study guide:
{text}

Format the study guide with sections for Definitions, Key Examples, and Review Points."""
        
        response = model.generate_content(prompt)
        if response.candidates and response.candidates[0].content.parts:
            return response.candidates[0].content.parts[0].text
        return "Error: Unable to generate study guide"
    except Exception as e:
        logger.error(f"Error in study guide generation: {str(e)}")
        raise

def generate_knowledge_graph(text):
    try:
        # Convert text to string if it's not already
        text_content = str(text)
        # Limit text length safely
        truncated_text = text_content[:1500] if len(text_content) > 1500 else text_content
        
        prompt = f"""Create a knowledge graph from this content. Format as JSON:
{truncated_text}

Return format:
{{
    "nodes": [
        {{"id": "concept1", "label": "Concept 1"}},
        {{"id": "concept2", "label": "Concept 2"}}
    ],
    "edges": [
        {{"from": "concept1", "to": "concept2", "label": "relates to"}}
    ]
}}"""
        
        response = model.generate_content(prompt)
        if response.candidates and response.candidates[0].content.parts:
            return response.candidates[0].content.parts[0].text
        return "Error: Unable to generate knowledge graph"
    except Exception as e:
        logger.error(f"Error in knowledge graph generation: {str(e)}")
        raise

def generate_flashcards(text):
    try:
        prompt = f"""Create a set of flashcards from this content:
{text}

Format each flashcard as:
Q1: [Question]
A1: [Answer]

Q2: [Question]
A2: [Answer]

Create at least 5 flashcards covering the main concepts."""

        response = model.generate_content(prompt)
        if response.candidates and response.candidates[0].content.parts:
            return response.candidates[0].content.parts[0].text
        return "Error: Unable to generate flashcards"
    except Exception as e:
        logger.error(f"Error in flashcard generation: {str(e)}")
        raise

# Add rate limiting
request_history = {}

def rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ip = request.remote_addr
        current_time = time.time()
        if ip in request_history:
            requests = [req for req in request_history[ip] 
                       if req > current_time - 60]
            if len(requests) >= Config.MAX_REQUESTS_PER_MINUTE:
                return jsonify({'error': 'Rate limit exceeded'}), 429
            request_history[ip] = requests
        request_history[ip] = request_history.get(ip, []) + [current_time]
        return f(*args, **kwargs)
    return decorated_function

# Add context management
class ConversationManager:
    def __init__(self):
        self.conversations = {}
        self.redis = redis_client
    
    def add_message(self, session_id, message):
        if self.redis:
            try:
                key = f"conv:{session_id}"
                messages = self.get_context(session_id)
                messages.append({
                    'content': message,
                    'timestamp': datetime.now().isoformat()
                })
                messages = messages[-Config.CONTEXT_MEMORY_SIZE:]
                self.redis.setex(
                    key,
                    timedelta(hours=24),
                    json.dumps(messages)
                )
            except Exception as e:
                logger.error(f"Redis error: {str(e)}")
                self._fallback_add_message(session_id, message)
        else:
            self._fallback_add_message(session_id, message)
    
    def _fallback_add_message(self, session_id, message):
        if session_id not in self.conversations:
            self.conversations[session_id] = []
        self.conversations[session_id].append({
            'content': message,
            'timestamp': datetime.now().isoformat()
        })
        self.conversations[session_id] = self.conversations[session_id][-Config.CONTEXT_MEMORY_SIZE:]
    
    def get_context(self, session_id):
        if self.redis:
            try:
                key = f"conv:{session_id}"
                data = self.redis.get(key)
                return json.loads(data) if data else []
            except Exception as e:
                logger.error(f"Redis error: {str(e)}")
                return self.conversations.get(session_id, [])
        return self.conversations.get(session_id, [])

conversation_manager = ConversationManager()

# Add metrics tracking
class Metrics:
    def __init__(self):
        self.requests_per_hour = {str(i): 0 for i in range(24)}
        self.response_times = {
            'upload': [],
            'quiz': [],
            'study_guide': [],
            'graph': [],
            'chat': []
        }
        self.total_requests = 0
        self.active_sessions = set()

    def track_request(self, endpoint, response_time):
        hour = datetime.now().strftime('%H')
        self.requests_per_hour[hour] += 1
        self.total_requests += 1
        if endpoint in self.response_times:
            self.response_times[endpoint].append(response_time)
            # Keep only last 100 measurements
            self.response_times[endpoint] = self.response_times[endpoint][-100:]

    def get_metrics(self):
        avg_response_times = {
            endpoint: sum(times) / len(times) if times else 0 
            for endpoint, times in self.response_times.items()
        }
        return {
            'requests_today': self.total_requests,
            'requests_per_hour': self.requests_per_hour,
            'avg_response_times': avg_response_times,
            'active_sessions': len(self.active_sessions)
        }

metrics = Metrics()

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    return jsonify(metrics.get_metrics())

# Update existing route decorators to track metrics
def track_metrics(endpoint):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            start_time = time.time()
            response = f(*args, **kwargs)
            end_time = time.time()
            metrics.track_request(endpoint, (end_time - start_time) * 1000)
            return response
        return wrapped
    return decorator

# Add before other routes
@app.route('/')
def api_documentation():
    return render_template('auth.html')

@app.route('/api/auth', methods=['POST'])
def authenticate():
    pin = request.json.get('pin')
    if pin == Config.ADMIN_PIN:
        return jsonify({'success': True, 'role': 'admin'}), 200
    elif pin == Config.USER_PIN:
        return jsonify({'success': True, 'role': 'user'}), 200
    return jsonify({'success': False, 'error': 'Invalid PIN'}), 401

@app.route('/docs')
def show_docs():
    base_url = request.url_root.rstrip('/')
    try:
        health_check()
        health_status = "API Active"
        health_status_color = "#27ae60"
    except:
        health_status = "API Inactive"
        health_status_color = "#c0392b"
    
    return render_template('api_docs.html',
                         base_url=base_url,
                         health_status=health_status,
                         health_status_color=health_status_color,
                         env_mode=os.getenv('FLASK_ENV', 'development'),
                         redis_status="Connected" if redis_client else "Disabled")

# Routes
@app.route('/api/upload', methods=['POST'])
@track_metrics('upload')
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        analysis = structured_analysis(process_file(file))
        return jsonify({
            'status': 'success',
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/create-quiz', methods=['POST'])
def create_quiz():
    try:
        if not request.json or 'notes' not in request.json:
            return jsonify({'error': 'No notes provided'}), 400
        
        notes = request.json['notes']
        quiz = generate_quiz(notes)
        return jsonify({
            'status': 'success',
            'quiz': quiz,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Quiz creation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-study-guide', methods=['POST', 'OPTIONS'])
def generate_study_guide_route():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    try:
        if not request.json or 'notes' not in request.json:
            return jsonify({'error': 'No notes provided'}), 400
        
        notes = request.json['notes']
        study_guide = generate_study_guide(notes)
        return jsonify({
            'status': 'success',
            'studyGuide': study_guide,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Study guide generation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Update the knowledge graph route to handle OPTIONS and fix the path
@app.route('/api/graph', methods=['POST', 'OPTIONS'])
def create_knowledge_graph():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    try:
        if not request.json or 'notes' not in request.json:
            return jsonify({'error': 'No notes provided'}), 400
        
        notes = request.json['notes']
        graph_data = generate_knowledge_graph(notes)
        
        # Try to parse the JSON response
        try:
            if isinstance(graph_data, str):
                graph_json = json.loads(graph_data)
            else:
                graph_json = graph_data

            return jsonify({
                'status': 'success',
                'graphData': graph_json,
                'timestamp': datetime.now().isoformat()
            })
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid graph data format'}), 500
            
    except Exception as e:
        logger.error(f"Knowledge graph creation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-flashcards', methods=['POST'])
def create_flashcards():
    try:
        if not request.json or 'notes' not in request.json:
            return jsonify({'error': 'No notes provided'}), 400
        
        notes = request.json['notes']
        flashcards = generate_flashcards(notes)
        return jsonify({
            'status': 'success',
            'flashcards': flashcards,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Flashcard creation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/track-progress', methods=['POST'])
def track_progress():
    try:
        if not request.json or 'progress' not in request.json:
            return jsonify({'error': 'No progress data provided'}), 400
        
        # Here you would typically save to a database
        # For now, we'll just echo back the progress
        return jsonify({
            'status': 'success',
            'progress': request.json['progress'],
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Progress tracking error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Update chat route to use single model
@app.route('/api/chat', methods=['POST'])
@rate_limit
def chat():
    if not request.json or 'message' not in request.json:
        return jsonify({'error': 'No message provided'}), 400

    # Generate session ID if not provided
    session_id = request.json.get('session_id', str(uuid4()))

    mode = request.json.get('mode', 'general')
    message = request.json['message']
    
    if mode == 'document' and not current_context:
        return jsonify({'error': 'No document context available'}), 400

    context = conversation_manager.get_context(session_id)
    
    enhanced_prompt = f"""Act as an educational AI assistant.
    Previous Context: {json.dumps([msg['content'] for msg in context])}
    Mode: {'Document-specific' if mode == 'document' else 'General learning'}
    Style: Clear, educational, and engaging with examples
    
    {f'Document Context: {current_context[:1500]}...' if mode == 'document' else 'Provide educational guidance.'}
    
    Additional Instructions:
    - Break down complex concepts
    - Provide real-world examples
    - Include analogies when helpful
    - Suggest related topics
    
    Question: {message}"""
    
    try:
        response = model.generate_content(enhanced_prompt)
        if response.candidates and response.candidates[0].content.parts:
            response_text = response.candidates[0].content.parts[0].text
            conversation_manager.add_message(session_id, {
                'role': 'assistant',
                'content': response_text
            })
            return jsonify({
                'status': 'success',
                'response': response_text,
                'model_used': 'gemini-2.0-flash-exp',
                'context_length': len(context),
                'suggestions': generate_follow_up_suggestions(response_text)
            })
        return jsonify({'error': 'Failed to generate response'}), 500
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return jsonify({'error': 'Failed to generate response'}), 500

# Add new utility functions
def generate_follow_up_suggestions(response):
    try:
        prompt = f"Based on this response, suggest 3 follow-up questions:\n{response}"
        suggestion_response = model.generate_content(prompt)
        if suggestion_response.candidates:
            return suggestion_response.candidates[0].content.parts[0].text.split('\n')
        return []
    except:
        return []

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not Found', 'message': str(error)}), 404

@app.errorhandler(400)
def bad_request_error(error):
    return jsonify({'error': 'Bad Request', 'message': str(error)}), 400

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal Server Error', 'message': str(error)}), 500

# Add production configuration
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
