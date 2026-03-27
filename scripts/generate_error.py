import aerospike
import sys
import time
import uuid

config = {'hosts': [('127.0.0.1', 3000)]}

try:
    client = aerospike.client(config).connect()
    print("✅ Connected to Aerospike successfully.")
except Exception as e:
    print(f"❌ Failed to connect to Aerospike: {e}")
    sys.exit(1)

def inject_error():
    error_id = f"ERR-{str(uuid.uuid4())[:8].upper()}"
    key = ('test', 'incidents', error_id)

    payload = {
        'id':         error_id,
        'status':     'new',
        'error_log':  'TypeError: Cannot read properties of undefined (reading "token")',
        'file':       'src/auth/login.js',
        'lineNumber': 87,
        'timestamp':  int(time.time()),
    }

    client.put(key, payload)
    print(f"🚨 [CRITICAL] Injected error into Aerospike → {error_id}")
    client.close()

if __name__ == "__main__":
    inject_error()