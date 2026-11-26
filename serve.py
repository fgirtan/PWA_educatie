"""Server local pentru dezvoltare: python3 serve.py [port]"""
import functools, http.server, socketserver, os, sys
D = os.path.dirname(os.path.abspath(__file__))
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8787
class NoCache(http.server.SimpleHTTPRequestHandler):
    # în dezvoltare: browserul cere mereu varianta nouă a fișierelor
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
H = functools.partial(NoCache, directory=D)
socketserver.ThreadingTCPServer.allow_reuse_address = True
socketserver.ThreadingTCPServer.daemon_threads = True
# mai multe cereri în paralel: altfel, cu mai multe taburi deschise, unele scripturi ajung trunchiate
with socketserver.ThreadingTCPServer(('127.0.0.1', port), H) as s:
    print('Universul Nostru → http://localhost:%d  (director: %s)' % (port, D))
    s.serve_forever()
