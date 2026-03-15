#!/usr/bin/env python3
"""
Backend Test Suite for ANATEL FISTEL API
Testing the newly implemented ANATEL endpoint and existing endpoints
"""

import requests
import json
import sys
from typing import Dict, Any

# API Base URL - Using internal backend service
BASE_URL = "http://localhost:8001/api"

def test_anatel_taxas_endpoint():
    """Test the ANATEL FISTEL taxes endpoint with multiple CNPJs"""
    print("🔍 Testing ANATEL FISTEL Taxes Endpoint...")
    
    test_cases = [
        {
            "cnpj": "12345678000190",
            "description": "Test case 1: Should return FISTEL taxes with TFF and TFI items"
        },
        {
            "cnpj": "98765432000100", 
            "description": "Test case 2: Different CNPJ, should return different values"
        }
    ]
    
    results = []
    
    for case in test_cases:
        cnpj = case["cnpj"]
        print(f"\n📋 {case['description']}")
        print(f"   Testing CNPJ: {cnpj}")
        
        try:
            url = f"{BASE_URL}/anatel/taxas/{cnpj}"
            print(f"   URL: {url}")
            
            response = requests.get(url, timeout=30)
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Success! Response received")
                
                # Validate response structure
                structure_valid = validate_anatel_response_structure(data, cnpj)
                math_valid = validate_anatel_math(data)
                
                results.append({
                    "cnpj": cnpj,
                    "success": True,
                    "structure_valid": structure_valid,
                    "math_valid": math_valid,
                    "data": data
                })
                
                # Print key information
                print(f"   📊 Service: {data.get('servico', 'N/A')}")
                print(f"   📊 Total Amount: R$ {data.get('total', 0):.2f}")
                print(f"   📊 Number of Tax Items: {len(data.get('taxas', []))}")
                print(f"   📊 Years in Debt: {data.get('quantidade_anos', 0)}")
                
            else:
                print(f"   ❌ Failed with status {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                results.append({
                    "cnpj": cnpj,
                    "success": False,
                    "error": f"HTTP {response.status_code}",
                    "response": response.text
                })
                
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
            results.append({
                "cnpj": cnpj,
                "success": False,
                "error": str(e)
            })
    
    return results

def validate_anatel_response_structure(data: Dict[str, Any], expected_cnpj: str) -> bool:
    """Validate that the response has the correct structure"""
    print(f"   🔍 Validating response structure...")
    
    required_fields = ['cnpj', 'servico', 'num_estacoes', 'quantidade_anos', 'total', 'taxas']
    
    for field in required_fields:
        if field not in data:
            print(f"   ❌ Missing required field: {field}")
            return False
    
    # Validate CNPJ matches
    if data['cnpj'] != expected_cnpj:
        print(f"   ❌ CNPJ mismatch: expected {expected_cnpj}, got {data['cnpj']}")
        return False
    
    # Validate taxas array structure
    taxas = data.get('taxas', [])
    if not isinstance(taxas, list) or len(taxas) == 0:
        print(f"   ❌ Invalid taxas array: should be non-empty list")
        return False
    
    # Validate each taxa item structure
    required_taxa_fields = ['tipo', 'periodo', 'principal', 'acrescimos', 'total_item']
    
    for i, taxa in enumerate(taxas):
        for field in required_taxa_fields:
            if field not in taxa:
                print(f"   ❌ Missing field '{field}' in taxa item {i}")
                return False
    
    print(f"   ✅ Response structure is valid")
    return True

def validate_anatel_math(data: Dict[str, Any]) -> bool:
    """Validate that total = sum of all total_item values in taxas array"""
    print(f"   🧮 Validating mathematical calculations...")
    
    expected_total = data.get('total', 0)
    taxas = data.get('taxas', [])
    
    calculated_total = sum(taxa.get('total_item', 0) for taxa in taxas)
    
    # Allow small floating point differences (0.01)
    if abs(expected_total - calculated_total) > 0.01:
        print(f"   ❌ Math error: expected total {expected_total}, calculated {calculated_total}")
        return False
    
    print(f"   ✅ Math validation passed: {calculated_total:.2f}")
    return True

def test_existing_debitos_endpoint():
    """Test that the existing DAS debts endpoint still works"""
    print("\n🔍 Testing Existing DAS Debts Endpoint...")
    
    cnpj = "12345678000190"
    url = f"{BASE_URL}/cnpj/{cnpj}/debitos"
    
    try:
        print(f"   URL: {url}")
        response = requests.get(url, timeout=30)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success! DAS endpoint still working")
            
            # Validate basic structure
            required_fields = ['cnpj', 'total', 'quantidade_meses', 'debitos']
            structure_valid = all(field in data for field in required_fields)
            
            if structure_valid:
                print(f"   ✅ Response structure is valid")
                print(f"   📊 Total DAS Debt: R$ {data.get('total', 0):.2f}")
                print(f"   📊 Months: {data.get('quantidade_meses', 0)}")
                return True
            else:
                print(f"   ❌ Invalid response structure")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def run_comprehensive_tests():
    """Run all tests and provide summary"""
    print("=" * 80)
    print("🚀 ANATEL FISTEL API Testing Suite")
    print("=" * 80)
    
    # Test ANATEL endpoint
    anatel_results = test_anatel_taxas_endpoint()
    
    # Test existing endpoint
    das_working = test_existing_debitos_endpoint()
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    
    anatel_passed = sum(1 for r in anatel_results if r.get('success') and r.get('structure_valid') and r.get('math_valid'))
    anatel_total = len(anatel_results)
    
    print(f"✨ ANATEL Taxes Endpoint: {anatel_passed}/{anatel_total} test cases passed")
    
    if das_working:
        print(f"✨ Existing DAS Endpoint: ✅ Working correctly")
    else:
        print(f"✨ Existing DAS Endpoint: ❌ Issues detected")
    
    # Detailed results for ANATEL tests
    print(f"\n📋 ANATEL Test Details:")
    for result in anatel_results:
        cnpj = result['cnpj']
        if result.get('success'):
            structure = "✅" if result.get('structure_valid') else "❌"
            math = "✅" if result.get('math_valid') else "❌"
            print(f"   CNPJ {cnpj}: Structure {structure}, Math {math}")
            
            if 'data' in result:
                data = result['data']
                print(f"      Total: R$ {data.get('total', 0):.2f}, Service: {data.get('servico', 'N/A')}")
        else:
            print(f"   CNPJ {cnpj}: ❌ Failed - {result.get('error', 'Unknown error')}")
    
    # Overall status
    overall_success = anatel_passed == anatel_total and das_working
    
    if overall_success:
        print(f"\n🎉 ALL TESTS PASSED! ANATEL FISTEL endpoint is working correctly.")
    else:
        print(f"\n⚠️  Some tests failed. Please check the details above.")
    
    return overall_success, anatel_results, das_working

if __name__ == "__main__":
    success, anatel_results, das_working = run_comprehensive_tests()
    
    # Exit with proper code for automation
    sys.exit(0 if success else 1)