import aerospike

config = {'hosts': [('127.0.0.1', 3000)]}

try:
    client = aerospike.client(config).connect()
    print("✅ [Aerospike Helper] Connected to Aerospike.")
except Exception as e:
    print(f"❌ [Aerospike Helper] Connection failed: {e}")
    raise

def get_new_errors_and_lock():
    """
    Scans the 'incidents' set for records with status == 'new'.
    Immediately flips status to 'investigating' to prevent double-processing.
    Returns a list of (key, record_dict) tuples.
    """
    try:
        query = client.query('test', 'incidents')
        records = query.results()

        new_errors = []
        for key, metadata, bins in records:
            if bins.get('status') == 'new':
                new_errors.append((key, bins))

                # Lock immediately — change status before yielding
                bins['status'] = 'investigating'
                client.put(key, bins)
                print(f"🔒 Locked {bins['id']} → status: investigating")

        return new_errors

    except Exception as e:
        print(f"⚠️  [Aerospike Helper] Query error: {e}")
        return []

def update_status(key, status):
    """General-purpose status updater for resolved/failed states."""
    try:
        _, _, bins = client.get(key)
        bins['status'] = status
        client.put(key, bins)
        print(f"✅ Updated record → status: {status}")
    except Exception as e:
        print(f"⚠️  [Aerospike Helper] Update error: {e}")