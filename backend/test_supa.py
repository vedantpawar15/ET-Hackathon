import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.supabase_client import get_supabase

print("Getting client...")
client = get_supabase()
print("Client created.")

print("Executing query...")
resp = client.table("documents").select("id").execute()
print("Query done.")
print(resp.data)
