from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time

# Initialize the WebDriver (specify the ChromeDriver path if needed)
driver = webdriver.Chrome()

target_urls = [
    "https://utrains.org/faq/",
]

text = ""

for url in target_urls:
    driver.get(url)

    # Wait for the page to load
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'body')))

    # Expand all FAQ questions (check the correct selector based on the page structure)
    try:
        faq_buttons = driver.find_elements(By.CSS_SELECTOR, 'a.faq-btn')
        for button in faq_buttons:
            driver.execute_script("arguments[0].click();", button)
            time.sleep(1)  # Add a delay to ensure the content has expanded
    except Exception as e:
        print(f"Error expanding FAQ: {e}")

    # Get the updated page source
    soup = BeautifulSoup(driver.page_source, 'html.parser')

    # Extract headers (FAQ questions) and bullet points
    for header in soup.find_all(['h1', 'h2', 'h3']):
        text += f"---\n{header.get_text()}\n"
    
    for paragraph in soup.find_all('p'):
        text += paragraph.get_text() + "\n"

    # Extract bullet points
    for ul in soup.find_all('ul'):
        for li in ul.find_all('li'):
            text += f"- {li.get_text()}\n"

    # Extract content within divs for additional text
    for div in soup.find_all('div', class_='card card-body'):
        text += div.get_text() + "\n"


# Save to a file with UTF-8 encoding
with open('website_text.txt', 'w', encoding='utf-8') as text_file:
    text_file.write(text)

print("Text extracted and saved successfully.")

driver.quit()
