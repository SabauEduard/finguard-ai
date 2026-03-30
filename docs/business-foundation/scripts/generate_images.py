#!/usr/bin/env python3
"""
Script pentru generarea automată PNG din HTML-uri
Necesită: pip install selenium pillow
          + ChromeDriver sau Firefox geckodriver
"""

import os
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from PIL import Image
import time

def html_to_png_selenium(html_path, output_path, width=1400, height=None):
    """
    Convertește HTML în PNG folosind Selenium + Chrome headless

    Args:
        html_path: Path la fișierul HTML
        output_path: Path pentru PNG output
        width: Lățime viewport (default 1400px)
        height: Înălțime viewport (None = auto)
    """
    # Setup Chrome headless
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument(f"--window-size={width},{height or 2000}")
    chrome_options.add_argument("--force-device-scale-factor=2")  # High DPI

    # Inițializare driver
    driver = webdriver.Chrome(options=chrome_options)

    try:
        # Încarcă HTML
        file_url = f"file://{os.path.abspath(html_path)}"
        driver.get(file_url)

        # Așteaptă randare completă
        time.sleep(2)

        # Dacă height e None, calculează dinamic
        if height is None:
            total_height = driver.execute_script("return document.body.scrollHeight")
            driver.set_window_size(width, total_height)
            time.sleep(1)

        # Screenshot
        driver.save_screenshot(output_path)
        print(f"✓ Generated: {output_path}")

        return True

    except Exception as e:
        print(f"✗ Error generating {output_path}: {e}")
        return False

    finally:
        driver.quit()


def html_to_png_playwright(html_path, output_path, width=1400):
    """
    Alternativă cu Playwright (mai ușor de instalat)
    pip install playwright
    playwright install chromium
    """
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={"width": width, "height": 2000})

            file_url = f"file://{os.path.abspath(html_path)}"
            page.goto(file_url)
            page.wait_for_timeout(2000)

            # Screenshot full page
            page.screenshot(path=output_path, full_page=True)

            browser.close()
            print(f"✓ Generated: {output_path}")
            return True

    except ImportError:
        print("Playwright not installed. Run: pip install playwright && playwright install chromium")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def main():
    """Generează toate PNG-urile din HTML-uri"""

    current_dir = Path(__file__).parent

    files_to_convert = [
        ("lean-canvas.html", "lean-canvas.png"),
        ("swot-analysis.html", "swot-analysis.png"),
    ]

    print("=" * 60)
    print("Generare PNG din HTML")
    print("=" * 60)

    # Încearcă Playwright mai întâi (mai simplu)
    print("\n[Metoda 1] Încercare cu Playwright...")
    playwright_available = False
    try:
        from playwright.sync_api import sync_playwright
        playwright_available = True
        print("✓ Playwright disponibil")
    except ImportError:
        print("✗ Playwright nu este instalat")

    if playwright_available:
        for html_file, png_file in files_to_convert:
            html_path = current_dir / html_file
            png_path = current_dir / png_file

            if html_path.exists():
                html_to_png_playwright(html_path, png_path, width=1400)
            else:
                print(f"✗ HTML not found: {html_path}")
    else:
        # Fallback la Selenium
        print("\n[Metoda 2] Încercare cu Selenium...")
        try:
            for html_file, png_file in files_to_convert:
                html_path = current_dir / html_file
                png_path = current_dir / png_file

                if html_path.exists():
                    html_to_png_selenium(html_path, png_path, width=1400)
                else:
                    print(f"✗ HTML not found: {html_path}")
        except Exception as e:
            print(f"\n✗ Selenium failed: {e}")
            print("\n" + "=" * 60)
            print("INSTRUCȚIUNI MANUAL:")
            print("=" * 60)
            print("1. Deschide HTML-urile în browser (Chrome/Firefox)")
            print("2. Zoom 100%")
            print("3. Screenshot: Cmd+Shift+4 (Mac) sau Print Screen (Windows)")
            print("4. Salvează ca PNG în același folder")
            print("\nSau instalează Playwright:")
            print("  pip install playwright")
            print("  playwright install chromium")


if __name__ == "__main__":
    main()
