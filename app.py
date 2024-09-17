from dotenv import load_dotenv
import openai
import os
from flask import Flask, render_template, request, jsonify
from openai import OpenAI


# Load environment variables
load_dotenv()

# Set OpenAI API key from environment variable
openai.api_key = os.getenv('OPENAI_API_KEY')

app = Flask(__name__)

# Load prompt from file
with open("website_text.txt", "r") as file:
    prompt = file.read()

# Updated prompt template
summary_template = prompt + """
You are a knowledgeable IT training company specializing in a variety of IT skills and technologies. Your expertise includes but is not limited to:

- Software Development (Python, Java, JavaScript, etc.)
- Data Science and Machine Learning
- Cloud Computing (AWS, Azure, Google Cloud)
- DevOps and Continuous Integration/Continuous Deployment (CI/CD)
- Web Development (Flask, Django, JavaScript frameworks)
- Cybersecurity and Networking
- Database Management (SQL, NoSQL, PostgreSQL, etc.)
- System Administration and Automation (Linux, Windows)
- Project Management and Agile Methodologies

If a question is not related to IT training or does not fall within these areas, respond with, "I am not sure about that.please feel free to rephrase your inquiry or provide your contact number. Our team will get in touch with you as soon as possible. Alternatively, you can reach us directly at +1 (302) 689 3440."

Question: {information}
Answer:
"""



def query_chatgpt(question):
    # Format the prompt with the question
    full_prompt = summary_template.format(information=question)
    
    # Make API request to OpenAI's chat endpoint
    client=OpenAI()
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  # Use the appropriate model
        messages=[
            {"role": "system", "content": full_prompt},
            {"role": "user", "content": question}
        ],
        max_tokens=50,  # Adjust as needed
        temperature=0.7
    )
    
    return (response.choices[0].message.content)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    question = data["question"]
    response = query_chatgpt(question)
    print(response)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True,port=80)
