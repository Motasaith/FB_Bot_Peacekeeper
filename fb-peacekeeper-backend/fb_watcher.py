import sys
import json
import time
import random
import argparse
import re
from DrissionPage import ChromiumPage, ChromiumOptions

def random_sleep(min_s=2, max_s=5):
    time.sleep(random.uniform(min_s, max_s))

def scrape_comments(page_url, account_name):
    # 1. Setup Undetectable Browser
    co = ChromiumOptions()
    # Use the account-specific profile folder created by login_once.py
    co.set_user_data_path(f"fb_profiles/{account_name}") 
    
    # Legacy Mobile Emulation (Android 6) - Forces mbasic.facebook.com more reliably
    # iPhone 14 Pro - Forces clean mobile layout for ALL accounts
    co.set_user_agent("Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1")
    
    # Launch!
    page = ChromiumPage(co)
    
    results = []
    seen_ids = set()
    
    try:
        # 2. Force Basic Mobile Site (The "Unbreakable" Version)
        # mbasic is purely HTML. It cannot block scrolling because it doesn't use Javascript for content.
        if "facebook.com" in page_url:
            # Convert any URL to mbasic
            # Extract the Page ID or Name if possible, or just trust the search
            if "profile.php" in page_url:
                 # Keep query params for profile ID
                 target_url = page_url.replace("www", "mbasic").replace("m.", "mbasic.")
            else:
                 target_url = page_url.replace("www", "mbasic").replace("m.", "mbasic.")
        else:
            target_url = page_url

        print(f"Debug: Visiting {target_url}", file=sys.stderr)
        page.get(target_url)
        
        # 3. Manual Login Check
        if "Log In" in page.title or page.ele("text:Log In"):
            print("Debug: Not logged in. Waiting for manual login...", file=sys.stderr)
            for _ in range(60):
                if "Log In" not in page.title:
                    print("Debug: Login detected!", file=sys.stderr)
                    break
                time.sleep(1)
        
        random_sleep(3, 5) # Wait for redirect/render
        
        # DEBUG: snapshot the feed
        print("Debug: Saving feed snapshot...", file=sys.stderr)
        page.get_screenshot(path='debug_drission_feed.png')
        with open('debug_drission_feed.html', 'w', encoding='utf-8') as f:
            f.write(page.html)

        # 4. Find the "Full Story" or "Comments"
        # The screenshot shows a large header, so we MUST scroll down to find posts.
        print("Debug: Scrolling to find posts...", file=sys.stderr)
        for _ in range(5):
            page.scroll.down(500)
            random_sleep(1, 2)
            
        try:
            page.wait.ele("tag:div", timeout=5)
        except:
            print("Debug: Timeout waiting for page load", file=sys.stderr)

        # Try to find the post link
        # Priority: "Comments" (Modern) > "Full Story" (mbasic)
        
        # DEBUG: Print all links to understand what the bot sees
        print("Debug: Scanning all links on page...", file=sys.stderr)
        all_as = page.eles("tag:a")
        for ix, a in enumerate(all_as[:20]): # Print first 20 links
             try:
                 txt = a.text
                 href = a.attr('href')
                 if txt or href:
                     print(f"Debug Link [{ix}]: Text='{txt}' Href='{href}'", file=sys.stderr)
             except: pass
        
        post_link = None
        
        # Look for text containing "Comments" or "Comment" e.g. "35 Comments"
        # DrissionPage fuzzy text match
        candidates = page.eles("text:Comment") 
        if candidates:
            post_link = candidates[0]
            print("Debug: Found 'Comment' text link", file=sys.stderr)
            
        if not post_link:
             # Try finding "Full Story"
             post_link = page.ele("text:Full Story")
             if post_link: print("Debug: Found 'Full Story' link", file=sys.stderr)

        if not post_link:
             # Try finding ANY link with 'story.php' in href (mbasic common pattern)
             # This is a strong fallback for mbasic
             all_links = page.eles("tag:a")
             for link in all_links:
                 if link.attr('href') and ('story.php' in link.attr('href') or '/posts/' in link.attr('href')):
                     # Check if it has "Like" or "Comment" nearby or inside?
                     # Actually, the story link usually IS the timestamp or "Full Story" text.
                     # We take the first one that seems to be a content link.
                     post_link = link
                     print(f"Debug: Found generic story link: {link.attr('href')}", file=sys.stderr)
                     break

        if not post_link:
             # Fallback: Maybe we are ALREADY on the post page?
             # Check if we see comment divs directly
             if page.eles("tag:div") and (page.ele("text:Like") or page.ele("text:Reply")):
                 print("Debug: No 'Full Story' link, but comments detected. assuming we are on the post page.", file=sys.stderr)
                 post_link = "ALREADY_THERE"
             else:
                 print("Debug: No direct links found. Dumping html for debug.", file=sys.stderr)
                 with open('debug_drission_nopost.html', 'w', encoding='utf-8') as f:
                    f.write(page.html)
            
        if post_link:
            if post_link != "ALREADY_THERE":
                print(f"Debug: Found post link: {post_link.text}", file=sys.stderr)
                post_link.click()
                random_sleep(2, 4)
            
            # 4.b Handle "Most relevant" filter (Common on m.facebook.com)
            try:
                # Look for the dropdown trigger
                filter_btn = page.ele("text:Most relevant")
                if filter_btn:
                    print("Debug: Found 'Most relevant' filter. Switching to 'All comments'...", file=sys.stderr)
                    filter_btn.click()
                    random_sleep(1, 2)
                    # Click "All comments" from the menu
                    all_comments_opt = page.ele("text:All comments")
                    if all_comments_opt:
                        all_comments_opt.click()
                        print("Debug: Selected 'All comments'.", file=sys.stderr)
                        random_sleep(2, 4)
                    else:
                        print("Debug: Could not find 'All comments' option.", file=sys.stderr)
                    
                    # Confirm selection (Click "OK" or "Apply" or "Filter" if present)
                    ok_btn = page.ele("text:OK") or page.ele("text:Apply") or page.ele("text:Done")
                    if ok_btn and ok_btn.states.is_displayed:
                        print(f"Debug: Clicking confirmation button: {ok_btn.text}", file=sys.stderr)
                        ok_btn.click()
                        random_sleep(2, 4)

            except Exception as e:
                print(f"Debug: Filter switch error: {e}", file=sys.stderr)

            # 5. Extract Comments (Infinite Loop)
            # Loop until we hit limit or cannot find more comments
            MAX_COMMENTS = 1000
            no_new_content_count = 0
            
            while len(results) < MAX_COMMENTS:
                # 1. Expand "View more comments" if available
                try:
                    # Look for "View more comments" or "View previous comments"
                    # Usually "View more comments" or "View 3 more comments"
                    more_btns = page.eles("text:View more comments")
                    if not more_btns:
                        more_btns = page.eles("text:View previous comments")
                    
                    if more_btns:
                        print("Debug: Clicking 'View more comments'...", file=sys.stderr)
                        for btn in more_btns:
                            if btn.states.is_displayed:
                                btn.click(by_js=True) # JS click is safer for overlay elements
                                random_sleep(2, 4)
                except:
                    pass
                
                # 2. Extract visible comments
                comment_divs = page.eles("tag:div")
                new_items_found = 0
                
                for div in comment_divs:
                    if len(results) >= MAX_COMMENTS: break
                    
                    try:
                        text_content = div.text
                        raw_lines = [l.strip() for l in text_content.split('\n') if l.strip()]
                        
                        if len(raw_lines) < 2: continue
                            
                        full_blob = " ".join(raw_lines).lower()
                        
                        # 1. STRUCTURAL VALIDATION (Relaxed)
                        has_signal = False
                        if "like" in full_blob and ("reply" in full_blob or "min" in full_blob or "h" in full_blob or "d" in full_blob):
                            has_signal = True
                        elif "reply" in full_blob:
                            has_signal = True
                            
                        if not has_signal: continue

                        # 2. Main Post Rejection
                        if "share" in full_blob and "comment" in full_blob: continue
                        if "fanpage's post" in full_blob or "subscribe" in full_blob: continue
                             
                        # 3. Wrapper Rejection
                        if "most relevant" in full_blob or "view more comments" in full_blob: continue

                        # 4. Extract Author & Text
                        author = raw_lines[0]
                        text_start_idx = 1
                        
                        # BADGE DETECTION
                        badges = ['rising fan', 'top fan', 'valued commenter', 'milestone follower', 'author', 'admin']
                        if author.lower() in badges and len(raw_lines) > 2:
                            author = f"{raw_lines[0]} {raw_lines[1]}"
                            text_start_idx = 2
                        
                        # Find Footer
                        footer_idx = -1
                        for i, r in enumerate(raw_lines):
                            if i < text_start_idx: continue
                            if len(r) > 60: continue # Footer safety
                            
                            r_lower = r.lower()
                            if ("like" in r_lower and ("reply" in r_lower or any(c.isdigit() for c in r))) or \
                               ("received" not in r_lower and "reply" in r_lower):
                                footer_idx = i
                                break
                        
                        if footer_idx == -1: continue 
                        
                        # Text Extraction
                        text_parts = raw_lines[text_start_idx:footer_idx]
                        comment_text = " ".join(text_parts).strip()
                        
                        # 5. CLEANING
                        if comment_text.lower().startswith(author.lower()):
                             comment_text = comment_text[len(author):].strip()

                        while True: # ITERATIVE SCRUBBER
                            original_len = len(comment_text)
                            comment_text = re.sub(r'\s+(Like|Reply|Edited)\s*$', '', comment_text, flags=re.IGNORECASE)
                            comment_text = re.sub(r'\s+\d+\s*[mhdyw]\s*$', '', comment_text, flags=re.IGNORECASE)
                            if len(comment_text) == original_len: break

                        # 6. JUNK DETECTION
                        if not comment_text or len(comment_text) < 2: continue
                        low_text = comment_text.lower()
                        if low_text in ['like', 'reply', 'like reply', 'share', 'edited']: continue
                        if re.match(r'^[\d\s\W]+$', comment_text): continue
                        if "browser" in low_text or "facebook app" in low_text: continue

                        c_id = str(hash(author + comment_text))
                        
                        if c_id not in seen_ids:
                            results.append({
                                "comment_id": c_id,
                                "author": author,
                                "text": comment_text,
                                "post_url": page.url
                            })
                            seen_ids.add(c_id)
                            new_items_found += 1
                            print(f"Debug: Extracted: {author} -> {comment_text[:20]}...", file=sys.stderr)
                            
                    except Exception:
                        continue
                
                # Scroll Logic
                if new_items_found == 0:
                    no_new_content_count += 1
                else:
                    no_new_content_count = 0 
                    
                # If we scraped everything visible, try scrolling
                print(f"Debug: Scrolled. Total: {len(results)}. New: {new_items_found}", file=sys.stderr)
                page.scroll.down(1000)
                random_sleep(1.5, 3)
                
                if no_new_content_count >= 5:
                    print("Debug: No new comments found after 5 scroll attempts. Finishing.", file=sys.stderr)
                    break
        
        else:
            print("Debug: Could not find 'Full Story' or 'Comment' link on feed page.", file=sys.stderr)
                    
    except Exception as e:
        print(f"Debug: Global Crash: {e}", file=sys.stderr)
        pass
        
    # Always close to clean up
    page.quit()
    
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--page_url', required=True)
    parser.add_argument('--account_name', default="default") 
    args = parser.parse_args()

    try:
        data = scrape_comments(args.page_url, args.account_name)
        print(json.dumps(data))
    except Exception as e:
        print(json.dumps([{"error": str(e)}]))