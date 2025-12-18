import sys
import argparse
import time
import os
from playwright.sync_api import sync_playwright

def run(account_name):
    auth_file = f'fb_auth_{account_name}.json'
    # Create a unique profile directory for this account to ensure total isolation and persistence
    profile_dir = f'fb_profiles/{account_name}'
    
    # Ensure profile dir exists (Playwright creates it, but good to know)
    if not os.path.exists('fb_profiles'):
        os.makedirs('fb_profiles')

    with sync_playwright() as p:
        print(f"[Login Script]: Launching persistent context for '{account_name}'...", flush=True)
        
        # Use launch_persistent_context as suggested
        context = p.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            headless=False,
            args=["--disable-blink-features=AutomationControlled"],
            # Viewport null allows the window to resize freely
            viewport=None,
            user_agent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        )
        
        # Persistent context opens with one page by default
        page = context.pages[0] if context.pages else context.new_page()
        
        print(f"[Login Script]: Navigating to Facebook...", flush=True)
        page.goto("https://www.facebook.com")
        
        print(f"[Login Script]: Waiting for login...", flush=True)
        # We poll for the 'c_user' cookie to detect login status automatically
        # This avoids the need for terminal input
        
        max_retries = 300 # 5 minutes
        logged_in = False
        
        for i in range(max_retries):
            try:
                # Check cookies
                cookies = context.cookies()
                if any(c['name'] == 'c_user' for c in cookies):
                    print("[Login Script]: [SUCCESS] Login detected ('c_user' cookie found)!", flush=True)
                    logged_in = True
                    break
                
                # Check if window was closed by user
                if page.is_closed():
                    print("[Login Script]: [ERROR] Browser closed by user before login completed.", flush=True)
                    context.close()
                    return

                time.sleep(1)
            except Exception as e:
                # If context closes unexpectedly
                print(f"[Login Script]: Checking loop error: {e}", flush=True)
                break
                
        if logged_in:
            print("[Login Script]: Saving session to JSON...", flush=True)
            # Give a moment for other cookies to settle
            time.sleep(3)
            
            # Save to the JSON file expected by the watcher
            context.storage_state(path=auth_file)
            print(f"[Login Script]: [SUCCESS] Session successfully saved to {auth_file}", flush=True)
            
            # Optional: Clear the page to show success
            try:
                page.set_content("<h1>Login Successful!</h1><p>Session saved. You can close this window now (or it will close automatically).</p>")
                time.sleep(2)
            except:
                pass
        else:
            print("[Login Script]: [ERROR] Timeout or failure detecting login.", flush=True)

        print("[Login Script]: Closing browser...", flush=True)
        context.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Manual Login for Facebook Watcher')
    parser.add_argument('--account_name', required=True, help='Name/Label for this account')
    args = parser.parse_args()
    
    run(args.account_name)
