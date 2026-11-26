"""Server local pentru dezvoltare: python3 serve.py [port]"""
import functools, http.server, socketserver, os, sys
D = os.path.dirname(os.path.abspath(__file__))
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8787
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=D)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', port), H) as s:
    print('Universul Nostru → http://localhost:%d  (director: %s)' % (port, D))
    s.serve_forever()
