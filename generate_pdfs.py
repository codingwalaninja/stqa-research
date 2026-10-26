import base64
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def generate_pdf(url, output_path):
    print(f"Generating PDF for {url} -> {output_path}...")
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=options)
    try:
        driver.set_window_size(1400, 1000)
        driver.get(url)
        # Give charts and webfonts time to load
        time.sleep(3)
        
        pdf_params = {
            'landscape': False,
            'displayHeaderFooter': False,
            'printBackground': True,
            'preferCSSPageSize': True,
            'paperWidth': 8.27,   # A4 width in inches
            'paperHeight': 11.69  # A4 height in inches
        }
        
        result = driver.execute_cdp_cmd('Page.printToPDF', pdf_params)
        pdf_bytes = base64.b64decode(result['data'])
        
        with open(output_path, 'wb') as f:
            f.write(pdf_bytes)
            
        print(f"Successfully generated {output_path} ({len(pdf_bytes):,} bytes)")
    finally:
        driver.quit()

if __name__ == '__main__':
    # 1. Generate updated Term Paper PDF
    generate_pdf(
        'http://localhost:8080/term-paper.html',
        'c:/Users/Dell/OneDrive/Desktop/STQA_research/Hybrid_AI_Software_Quality_Prediction_Term_Paper.pdf'
    )
    
    # 2. Generate Comprehensive System Guide PDF
    generate_pdf(
        'http://localhost:8080/system-guide.html',
        'c:/Users/Dell/OneDrive/Desktop/STQA_research/HybridQA_System_Guide_and_Documentation.pdf'
    )
    print("All PDFs successfully created!")
