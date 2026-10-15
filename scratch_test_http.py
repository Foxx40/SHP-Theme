import urllib.request

urls = [
    "http://localhost:8092/index.html",
    "http://localhost:8092/products/levitating-galaxy-orb.html",
    "http://localhost:8092/pages/faq.html",
    "http://localhost:8092/pages/shipping-duties.html",
    "http://localhost:8092/pages/returns.html",
    "http://localhost:8092/pages/track-order.html"
]

for url in urls:
    try:
        req = urllib.request.urlopen(url)
        print(f"[OK] {url} -> status {req.status}, {len(req.read())} bytes")
    except Exception as e:
        print(f"[FAIL] {url} -> {e}")
