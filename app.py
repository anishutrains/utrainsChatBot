from dotenv import load_dotenv
import openai
import boto3
import os
import PyPDF2
import io
from docx import Document
from flask import Flask, render_template, request, jsonify,session
from openai import OpenAI
from flask_cors import CORS
import mysql.connector
import uuid
from flask_session import Session  # Import Session from flask_session

import psycopg2
from psycopg2 import sql

# Load environment variables
load_dotenv()

# Set OpenAI API key from environment variable
openai.api_key = os.getenv('OPENAI_API_KEY')

# AWS S3 Setup using IAM Role
s3_client = boto3.client('s3')  # boto3 will automatically use the instance role credentials

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
# Configure the session to use filesystem (or another type like Redis if needed)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False  # Use False for non-permanent sessions

# Initialize the Session with the app
Session(app)
CORS(app)

#setting  MySQL database connection
# db = mysql.connector.connect(
#     host=os.getenv('DB_HOST'),
#     user=os.getenv('DB_USER'),
#     password=os.getenv('DB_PASSWORD'),
#     database=os.getenv('DB_NAME')
# )

# db_config = {
#     "host": os.getenv('DB_HOST'),
#     "user": os.getenv('DB_USER'),
#     "password": os.getenv('DB_PASSWORD'),
#     "database": os.getenv('DB_NAME')
# }

#for postgresql
db_config = {
    "host": "localhost",
    "database": "postgres",
    "user": "postgres",
    "password": "admin"
}

def get_db_connection():
    # return mysql.connector.connect(**db_config)
    return psycopg2.connect(**db_config)


def get_text_from_txt(file_content):
    #print(file_content.decode('utf-8'))
    return file_content.decode('utf-8')

def get_text_from_pdf(file_content):
    pdf_reader = PyPDF2.PdfFileReader(io.BytesIO(file_content))
    text = ""
    for page_num in range(pdf_reader.numPages):
        text += pdf_reader.getPage(page_num).extract_text()
    return text

def get_text_from_docx(file_content):
    document = Document(io.BytesIO(file_content))
    text = "\n".join([para.text for para in document.paragraphs])
    return text

def get_training_data_from_s3():
    bucket_name = os.getenv('BUCKET_NAME')
    training_text = ""

    # List all objects in the bucket
    response = s3_client.list_objects_v2(Bucket=bucket_name)
    for obj in response.get('Contents', []):
        file_key = obj['Key']
        
        # Get the object from S3
        file_obj = s3_client.get_object(Bucket=bucket_name, Key=file_key)
        file_content = file_obj['Body'].read()

        # Process based on file type
        if file_key.endswith('.txt'):
            training_text += get_text_from_txt(file_content) + "\n"
        elif file_key.endswith('.pdf'):
            training_text += get_text_from_pdf(file_content) + "\n"
        elif file_key.endswith('.docx'):
            training_text += get_text_from_docx(file_content) + "\n"

    return training_text

# Load prompt from S3
prompt = get_training_data_from_s3()

# Updated prompt template
summary_template = prompt + """
Hello! I am Utrains' AI-powered assistant here to help you explore our IT training programs and guide you in selecting the right course tailored to your needs.

We specialize in providing hands-on, industry-relevant training in cutting-edge IT technologies, including:
- Generative AI with Python
- Cloud Computing (AWS, Azure, Google Cloud)
- DevOps and CI/CD methodologies
- System Administration (Linux, Windows)
- Docker, Kubernetes, and Container Technologies
- Infrastructure as Code (Terraform, Ansible)
- Agile Project Management
- Bash and Python Scripting
- Many more...

### Let's make sure we find the best training path for you!
To assist you better, could you please share your **specific learning interests or goals**? For example, are you looking to upskill in cloud technologies, improve your DevOps knowledge, or explore AI development?

We offer personalized courses to fit your career stage—whether you're a beginner, an advanced learner, or a professional looking for certifications.

#### Would you like to:
1. **Register for a course now**? [Click here to view available courses and enroll](https://www.utrains.com/courses).
2. **Speak to a Utrains expert** to get tailored advice? Please **provide your mobile number** and **email address**, and we’ll contact you to schedule a free consultation.
3. **Get a detailed course brochure** for one of our programs? Just let me know which course you're interested in.

**If your question is not related to our training programs**, I may not be able to assist you directly, but feel free to provide your contact details, and our team will follow up shortly.

Alternatively, you can reach us directly at **+1 (302) 689 3440** or via email at **contact@utrains.org**.

**Pro Tip:** We offer limited-time discounts for early registrants, so don't miss your chance to upskill with us!
"""

def query_chatgpt(question):
    # Format the prompt with the question
    full_prompt = summary_template.format(information=question)

    # Make API request to OpenAI's chat endpoint
    try:
        client = OpenAI()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Use the appropriate model
            messages=[
                {"role": "system", "content": full_prompt},
                {"role": "user", "content": question}
            ],
            max_tokens=300,  # Adjust as needed
            temperature=0.7
        )

        answer = response.choices[0].message.content.strip()
        formatted_response = answer.replace("\n", "")
        return formatted_response
    except Exception as e:
        print(f"Error querying OpenAI API: {e}")
        return "I'm currently having trouble responding. Please try again later."
        


@app.before_request
def start_user_session():
    # Generate a unique session ID for each user if it doesn't exist
    #print(f" inserting ",session)
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
        
        # Insert new user into the users table
        # print(f" inserting here ",session)
        # db = get_db_connection()
        # cursor = db.cursor()
        
        # Assuming only an ID is required initially; adjust the fields if you have more data to insert
        # try:
        #     cursor.execute("INSERT INTO users (id) VALUES (%s)", (session['user_id'],))
        #     db.commit()
        #     print(f"success inserting user into the users table:")
        # except Exception as e:
        #     db.rollback()
        #     print(f"Error inserting user into the users table: {e}")
        # finally:
        #     cursor.close()
        #     db.close()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/utrains")
def utrains():
    return render_template("utrains.html")

# @app.route('/conversations', methods=['GET'])
# def get_conversations():
#     cursor = db.cursor(dictionary=True)
#     cursor.execute("SELECT * FROM conversations ORDER BY timestamp DESC")
#     conversations = cursor.fetchall()

#     return jsonify(conversations)

@app.route('/api/conversations/<user_id>', methods=['GET'])
def get_conversations_new(user_id):
    #cursor = db.cursor(dictionary=True)
    db = get_db_connection()
    #cursor = db.cursor(dictionary=True)
    cursor = db.cursor()
    cursor.execute("SELECT user_message, bot_response FROM conversations WHERE user_id = %s", (user_id,))
    conversations = cursor.fetchall()
    cursor.close()
    return jsonify(conversations)

@app.route('/conversations', methods=['GET'])
def get_conversations():
    db = get_db_connection()
    #cursor = db.cursor(dictionary=True)
    cursor = db.cursor()
    try:
        cursor.execute("SELECT * FROM conversations WHERE user_id = %s ORDER BY timestamp DESC", (session['user_id'],))
        conversations = cursor.fetchall()
        return jsonify(conversations)
    except Exception as e:
        return jsonify({'error': f'Error retrieving conversations: {e}'}), 500
    finally:
        cursor.close()
        db.close()

@app.route('/check_user_contact_info', methods=['GET'])
def check_user_contact_info():
    db = get_db_connection()
    cursor = db.cursor()
    user_id = session['user_id']

    try:
        cursor.execute("SELECT COUNT(*) FROM user_contact_info WHERE user_id = %s", (user_id,))
        result = cursor.fetchone()
        # Check if any record exists for the given user_id
        exists = result[0] > 0
        print("exists",exists)
        print("user_id",user_id)
        return jsonify({"exists": exists})
    except Exception as e:
        return jsonify({'error': f'Error checking user contact info: {e}'}), 500
    finally:
        cursor.close()
        db.close()

@app.route('/api/get_user_contacts', methods=['GET'])
def get_user_contacts():
    db = get_db_connection()
    cursor = db.cursor()
    #user_id = session['user_id']  # Assuming user_id is stored in the session

    try:
        # Fetch all contact details for the user
        cursor.execute("SELECT user_id,mobile_number, email FROM user_contact_info")
        contacts = cursor.fetchall()

        # Format the data as a list of dictionaries
        contact_list = [
            {"id": contact[0],"mobile_number": contact[1],  "email": contact[2]}
            for contact in contacts
        ]
        print('contact_list',contact_list)
        return jsonify(contact_list)
    except Exception as e:
        return jsonify({'error': f'Error fetching user contacts: {e}'}), 500
    finally:
        cursor.close()
        db.close()



@app.route("/chathistory")
def chathistory():
    return render_template("chatHistory.html")


@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    question = data["question"]
    response = query_chatgpt(question)
   
    # Store the conversation in the database
    db = get_db_connection()
    cursor = db.cursor()
    #cursor = db.cursor(dictionary=True)
    query = "INSERT INTO conversations (user_id, user_message, bot_response) VALUES (%s, %s, %s)"
    values = (session['user_id'], question, response)
    try:
        cursor.execute(query, values)
        db.commit()
        return jsonify({"response": response})
    except Exception as e:
        db.rollback()
        return jsonify({'error': f'Error storing conversation: {e}'}), 500
    finally:
        cursor.close()
        db.close()
    


# POST route to handle contact info submission
@app.route('/submit-contact-info', methods=['POST'])
def submit_contact_info():
    data = request.get_json()
    mobile_number = data.get('mobileNumber')
    email = data.get('email')
    user_id=session['user_id']
    
    if not mobile_number or not email:
        return jsonify({'error': 'Mobile number and email are required.'}), 400

    # Query to insert data into the user_contact_info table
    print("i am in the contact save details");
    query = 'INSERT INTO user_contact_info (mobile_number, email,user_id) VALUES (%s, %s,%s)'
    
    # Execute the query
    #cursor = db.cursor(dictionary=True)
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute(query, (mobile_number, email,user_id))
        db.commit()
        return jsonify({'message': 'Contact info stored successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': 'Error storing contact info: ' + str(e)}), 500
    finally:
        cursor.close()
        db.close()

@app.route('/api/users', methods=['GET'])
def get_users():
    db = get_db_connection()
    #cursor = db.cursor(dictionary=True)
    cursor = db.cursor()

    # Get the date parameter from the query string
    selected_date = request.args.get('date', None)

    if selected_date:
        print("I am great",selected_date)
        cursor.execute(
            "SELECT DISTINCT user_id, DATE(created_at) AS created_at FROM conversations WHERE DATE(created_at) = %s",
            (selected_date,)
        )
    else:
        print("I am here")
        cursor.execute(
            "SELECT DISTINCT user_id, DATE(created_at) AS created_at FROM conversations"
        )

    users = cursor.fetchall()
    cursor.close()

    formatted_users = [
        {"user_id": user[0], "created_at": user[1]} for user in users
    ]
    return jsonify(formatted_users)



if __name__ == "__main__":
    app.run(debug=True, port=8000)


# ssh -i ~/.ssh/my-ec2-key.pem ec2-user@54.123.45.67
# scp -i selenium-key-pair.pem app.py ubuntu@3.110.209.222:/home/ubuntu/utrainsChatBot/
# sudo nohup ~/utrainsChatBot/venv/bin/python app.py --port=80 > flask_app.log 2>&1 &
#sudo lsof -i :80
#sudo mysql -u root -p
#Admin@321

#CREATE DATABASE chatbot_db
#CREATE USER 'utrains'@'localhost' IDENTIFIED BY 'Admin@321';

# sudo chmod -R 755 /home/ubuntu/utrainsChatBot/build
# sudo chown -R www-data:www-data /home/ubuntu/utrainsChatBot/build
# sudo chmod +x /home/ubuntu
# sudo chmod +x /home/ubuntu/utrainsChatBot
#scp -i selenium-key-pair.pem -r chatbot-dashboard/build ubuntu@3.110.209.222:/home/ubuntu/utrainsChatBot/
