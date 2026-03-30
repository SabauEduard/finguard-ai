#!/usr/bin/env python3
"""
Full-page screenshot cu calcul automat al înălțimii
Necesită: pip install selenium pillow
"""

import os
import sys
from pathlib import Path

def screenshot_fullpage_chrome(html_path, output_path, width=1400):
    """
    Face screenshot full-page folosind Chrome headless
    Calculează automat înălțimea necesară
    """
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from PIL import Image
        import time

        # Setup Chrome
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--hide-scrollbars")
        chrome_options.add_argument(f"--window-size={width},1000")  # Start small
        chrome_options.add_argument("--force-device-scale-factor=2")  # Retina

        driver = webdriver.Chrome(options=chrome_options)

        try:
            # Load HTML
            file_url = f"file://{os.path.abspath(html_path)}"
            driver.get(file_url)
            time.sleep(2)  # Wait for render

            # Calculate full height
            total_width = driver.execute_script("return document.body.scrollWidth")
            total_height = driver.execute_script("return document.body.scrollHeight")

            print(f"📐 Content dimensions: {total_width}x{total_height}px")

            # Resize to exact dimensions
            driver.set_window_size(width, total_height)
            time.sleep(1)

            # Screenshot
            driver.save_screenshot(output_path)

            # Get actual file size
            size_mb = os.path.getsize(output_path) / 1024 / 1024
            print(f"✓ Screenshot saved: {output_path}")
            print(f"  File size: {size_mb:.2f} MB")

            # Check actual image dimensions
            img = Image.open(output_path)
            print(f"  Image dimensions: {img.width}x{img.height}px")

            return True

        finally:
            driver.quit()

    except ImportError:
        print("✗ Selenium not installed. Run: pip install selenium pillow")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def screenshot_fullpage_simple(html_path, output_path, width=1400, height=5000):
    """
    Metodă simplă - folosește Chrome direct cu dimensiune mare
    """
    import subprocess

    file_url = f"file://{os.path.abspath(html_path)}"

    cmd = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--screenshot={output_path}",
        f"--window-size={width},{height}",
        "--virtual-time-budget=10000",
        file_url
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if os.path.exists(output_path):
            size_mb = os.path.getsize(output_path) / 1024 / 1024
            print(f"✓ Screenshot saved: {output_path} ({size_mb:.2f} MB)")

            # Try to get dimensions
            try:
                from PIL import Image
                img = Image.open(output_path)
                print(f"  Image dimensions: {img.width}x{img.height}px")
            except:
                pass

            return True
        else:
            print(f"✗ Failed to create {output_path}")
            return False

    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def main():
    if len(sys.argv) < 3:
        print("Usage: python screenshot_fullpage.py <html_file> <output_png> [width]")
        print("\nExample:")
        print("  python screenshot_fullpage.py lean-canvas.html lean-canvas.png 1400")
        sys.exit(1)

    html_file = sys.argv[1]
    output_file = sys.argv[2]
    width = int(sys.argv[3]) if len(sys.argv) > 3 else 1400

    if not os.path.exists(html_file):
        print(f"✗ HTML file not found: {html_file}")
        sys.exit(1)

    print("=" * 60)
    print("Full-Page Screenshot Generator")
    print("=" * 60)
    print(f"Source: {html_file}")
    print(f"Output: {output_file}")
    print(f"Width: {width}px")
    print()

    # Încearcă mai întâi cu Selenium (mai precis)
    print("[Method 1] Trying with Selenium (auto-height)...")
    success = screenshot_fullpage_chrome(html_file, output_file, width)

    if not success:
        # Fallback la Chrome direct cu înălțime fixă mare
        print("\n[Method 2] Trying with Chrome headless (fixed height)...")
        success = screenshot_fullpage_simple(html_file, output_file, width, height=5000)

    if success:
        print("\n✓ Screenshot generated successfully!")
        # Open the image
        os.system(f"open {output_file}")
    else:
        print("\n✗ Failed to generate screenshot")
        sys.exit(1)


if __name__ == "__main__":
    main()
