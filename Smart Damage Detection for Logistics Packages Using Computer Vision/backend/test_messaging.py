#!/usr/bin/env python3
"""
Integration test for the messaging API endpoints.
This script tests the messaging functionality without requiring a full deployment.

Requirements:
- PostgreSQL database running and configured via POSTGRES_DSN environment variable
- Backend dependencies installed (fastapi, asyncpg, etc.)
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

async def test_messaging():
    """Test the messaging functionality."""
    from db import pg
    
    print("Testing messaging functionality...")
    
    # Check if database is configured
    if not os.getenv("POSTGRES_DSN"):
        print("⚠️  POSTGRES_DSN not configured - skipping database tests")
        print("   To test with database, set POSTGRES_DSN environment variable")
        return True  # Not a failure, just skipped
    
    try:
        # Initialize database
        await pg.init_pool()
        print("✅ Database connection established")
        
        # Test 1: Insert a test package
        package_id = await pg.insert_package(
            tracking_code="TEST-MSG-001",
            status="damaged",
            severity="warning",
            damage_type="dent",
            confidence=0.85
        )
        print(f"✅ Created test package with ID: {package_id}")
        
        # Test 2: Add messages
        msg1 = await pg.insert_message(package_id, "Test User 1", "This is the first message")
        print(f"✅ Added message 1: ID={msg1['id']}, Timestamp={msg1['timestamp']}")
        
        msg2 = await pg.insert_message(package_id, "Test User 2", "This is the second message")
        print(f"✅ Added message 2: ID={msg2['id']}, Timestamp={msg2['timestamp']}")
        
        # Test 3: Retrieve messages
        messages = await pg.get_messages(package_id)
        print(f"✅ Retrieved {len(messages)} messages")
        
        for i, msg in enumerate(messages, 1):
            print(f"   Message {i}: [{msg['author']}] {msg['message'][:50]}...")
        
        # Verify we got both messages back
        assert len(messages) == 2, f"Expected 2 messages, got {len(messages)}"
        assert messages[0]['author'] == "Test User 1"
        assert messages[1]['author'] == "Test User 2"
        
        print("\n✅ All tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # Clean up
        await pg.close_pool()
        print("✅ Database connection closed")
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_messaging())
    sys.exit(0 if success else 1)
