"use client";
import { useState } from 'react';

export default function TestAuthPage() {
  const [result, setResult] = useState<string>('');

  const testLogin = async () => {
    try {
      console.log('Testing login...');
      
      const payload = { 
        username: 'eps364', 
        password: 'C0nnect123' 
      };
      
      console.log('Payload:', payload);
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setResult(`Login OK: ${JSON.stringify(data)}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error data:', errorData);
        setResult(`Login FAILED: ${response.status} - ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setResult(`Login ERROR: ${error}`);
    }
  };

  const testMe = async () => {
    try {
      console.log('Testing /me endpoint...');
      
      const response = await fetch('http://localhost:8080/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setResult(`Me OK: ${JSON.stringify(data)}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error data:', errorData);
        setResult(`Me FAILED: ${response.status} - ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Me error:', error);
      setResult(`Me ERROR: ${error}`);
    }
  };

  const testFullFlow = async () => {
    try {
      setResult('Testing full flow...\n');
      
      // Step 1: Login
      console.log('Step 1: Login');
      const loginPayload = { 
        username: 'eps364', 
        password: 'C0nnect123' 
      };
      
      const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(loginPayload)
      });
      
      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}));
        setResult(`Login failed: ${loginResponse.status} - ${JSON.stringify(errorData)}`);
        return;
      }
      
      const loginData = await loginResponse.json();
      console.log('Login successful:', loginData);
      
      // Step 2: Test /me
      console.log('Step 2: Test /me');
      const meResponse = await fetch('http://localhost:8080/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('/me successful:', meData);
        setResult(`Full flow successful!\nLogin: ${JSON.stringify(loginData)}\n/me: ${JSON.stringify(meData)}`);
      } else {
        const errorData = await meResponse.json().catch(() => ({}));
        setResult(`/me failed: ${meResponse.status} - ${JSON.stringify(errorData)}`);
      }
      
    } catch (error) {
      console.error('Full flow error:', error);
      setResult(`Full flow ERROR: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Auth</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testLogin} style={{ marginRight: '10px' }}>
          Test Login
        </button>
        <button onClick={testMe} style={{ marginRight: '10px' }}>
          Test /me
        </button>
        <button onClick={testFullFlow}>
          Test Full Flow
        </button>
      </div>
      <div style={{ 
        padding: '10px', 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
        minHeight: '100px',
        whiteSpace: 'pre-wrap'
      }}>
        {result || 'No result yet...'}
      </div>
    </div>
  );
}
