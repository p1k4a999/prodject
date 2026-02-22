import requests
import sys
import json
from datetime import datetime

class BackendAPITester:
    def __init__(self, base_url="https://self-intro-42.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            else:
                response = requests.request(method, url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            result = {
                'test_name': name,
                'success': success,
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'response_time': response.elapsed.total_seconds(),
                'url': url
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code} (Response time: {response.elapsed.total_seconds():.2f}s)")
                try:
                    response_json = response.json()
                    result['response_data'] = response_json
                    print(f"   Response: {json.dumps(response_json, indent=2, ensure_ascii=False)[:200]}...")
                except:
                    result['response_data'] = response.text[:100]
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                result['error'] = response.text

            self.test_results.append(result)
            return success, response.json() if response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                'test_name': name,
                'success': False,
                'error': str(e),
                'url': url
            })
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test("API Health Check", "GET", "", 200)

    def test_create_valid_lead(self):
        """Test creating a valid lead"""
        test_data = {
            "name": "Тестовый Пользователь",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "phone": "+7 999 123 45 67"
        }
        success, response = self.run_test(
            "Create Valid Lead", 
            "POST", 
            "leads", 
            200, 
            data=test_data
        )
        
        if success:
            # Verify response structure
            required_fields = ['id', 'name', 'email', 'created_at', 'message']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing required field: {field}")
                    return False, response
            
            # Store lead ID for further tests
            self.lead_id = response.get('id')
            print(f"   Created lead with ID: {self.lead_id}")
            
        return success, response

    def test_create_lead_missing_name(self):
        """Test creating lead without name (should fail)"""
        test_data = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        }
        return self.run_test(
            "Create Lead Missing Name", 
            "POST", 
            "leads", 
            422, 
            data=test_data
        )

    def test_create_lead_invalid_email(self):
        """Test creating lead with invalid email (should fail)"""
        test_data = {
            "name": "Test User",
            "email": "invalid-email"
        }
        return self.run_test(
            "Create Lead Invalid Email", 
            "POST", 
            "leads", 
            422, 
            data=test_data
        )

    def test_create_lead_empty_name(self):
        """Test creating lead with empty name (should fail)"""
        test_data = {
            "name": "A",  # Too short
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        }
        return self.run_test(
            "Create Lead Short Name", 
            "POST", 
            "leads", 
            422, 
            data=test_data
        )

    def test_duplicate_email(self):
        """Test creating lead with duplicate email"""
        # First, create a lead
        test_email = f"duplicate_{datetime.now().strftime('%H%M%S')}@example.com"
        test_data = {
            "name": "First User",
            "email": test_email
        }
        success1, response1 = self.run_test(
            "Create First Lead (for duplicate test)", 
            "POST", 
            "leads", 
            200, 
            data=test_data
        )
        
        if not success1:
            return False, {}
            
        # Try to create the same email again
        test_data['name'] = "Second User"
        success2, response2 = self.run_test(
            "Create Duplicate Email Lead", 
            "POST", 
            "leads", 
            200,  # Should still return 200 but with existing user data
            data=test_data
        )
        
        if success2:
            # Should return message about already registered
            if 'уже зарегистрированы' in response2.get('message', ''):
                print(f"✅ Correctly handled duplicate email")
                return True, response2
            else:
                print(f"❌ Duplicate email not handled correctly")
                return False, response2
        
        return success2, response2

    def test_get_leads(self):
        """Test getting all leads (admin endpoint)"""
        return self.run_test("Get All Leads", "GET", "leads", 200)

    def test_get_stats(self):
        """Test getting lead statistics"""
        success, response = self.run_test("Get Lead Stats", "GET", "leads/stats", 200)
        
        if success:
            # Verify stats structure
            required_fields = ['total_leads', 'today_leads']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing stats field: {field}")
                    return False, response
            print(f"   Stats - Total: {response.get('total_leads')}, Today: {response.get('today_leads')}")
            
        return success, response

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting Backend API Testing...")
        print(f"   Base URL: {self.base_url}")
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_create_valid_lead,
            self.test_create_lead_missing_name,
            self.test_create_lead_invalid_email,
            self.test_create_lead_empty_name,
            self.test_duplicate_email,
            self.test_get_leads,
            self.test_get_stats,
        ]
        
        for test_func in tests:
            try:
                test_func()
            except Exception as e:
                print(f"❌ Test {test_func.__name__} crashed: {str(e)}")
                self.test_results.append({
                    'test_name': test_func.__name__,
                    'success': False,
                    'error': f"Test crashed: {str(e)}"
                })
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test_name']}: {test.get('error', 'Status mismatch')}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = BackendAPITester()
    success = tester.run_all_tests()
    
    # Save test results
    with open('/tmp/backend_test_results.json', 'w') as f:
        json.dump({
            'success': success,
            'tests_run': tester.tests_run,
            'tests_passed': tester.tests_passed,
            'results': tester.test_results,
            'timestamp': datetime.now().isoformat()
        }, f, indent=2, ensure_ascii=False)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())