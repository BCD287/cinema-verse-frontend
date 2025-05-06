
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL } from '@/lib/constants';
import { fetchWithProxy } from '@/middleware/corsProxy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ApiTester() {
  const [endpoint, setEndpoint] = useState('/movies');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithProxy(endpoint, {}, {});
      setResult(JSON.stringify(response, null, 2));
    } catch (err) {
      setError(err.message || 'An error occurred');
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Tester</CardTitle>
        <CardDescription>
          Test API endpoints directly from the browser
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{API_URL}</span>
            <Input 
              value={endpoint} 
              onChange={e => setEndpoint(e.target.value)}
              placeholder="/endpoint"
              className="flex-1"
            />
            <Button onClick={testApi} disabled={loading}>
              {loading ? 'Testing...' : 'Test'}
            </Button>
          </div>
          
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {result && (
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-xs whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
