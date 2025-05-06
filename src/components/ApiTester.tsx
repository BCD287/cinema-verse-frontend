
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL } from '@/lib/constants';
import { fetchWithProxy } from '@/middleware/corsProxy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy } from 'lucide-react';

export function ApiTester() {
  const [endpoint, setEndpoint] = useState('/movies');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setRawResponse(null);
    
    try {
      // First get the raw response text
      const fullUrl = `${API_URL}${endpoint}`;
      const response = await fetch(fullUrl, {
        headers,
        mode: 'cors'
      });
      
      const rawText = await response.clone().text();
      setRawResponse(rawText);
      
      // Then try to process it through our proxy
      const processedResponse = await fetchWithProxy(endpoint, {}, {});
      setResult(JSON.stringify(processedResponse, null, 2));
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const fetchDirectCode = `
fetch('${API_URL}${endpoint}', {
  headers: ${JSON.stringify(headers, null, 2)},
  mode: 'cors'
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
  `.trim();

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
            <span className="text-sm text-muted-foreground shrink-0">{API_URL}</span>
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
          
          <div className="bg-muted p-4 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Headers being sent:</h3>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1"
                onClick={() => copyToClipboard(JSON.stringify(headers, null, 2))}
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </Button>
            </div>
            <pre className="text-xs bg-muted-foreground/10 p-2 rounded overflow-auto">
              {JSON.stringify(headers, null, 2)}
            </pre>
          </div>
          
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <Tabs defaultValue="processed" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="processed">Processed JSON</TabsTrigger>
              <TabsTrigger value="raw">Raw Response</TabsTrigger>
              <TabsTrigger value="code">Code Sample</TabsTrigger>
            </TabsList>
            
            <TabsContent value="processed">
              {result ? (
                <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-xs whitespace-pre-wrap">{result}</pre>
                </div>
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  {loading ? 'Loading...' : 'No result yet'}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="raw">
              {rawResponse ? (
                <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-xs whitespace-pre-wrap">{rawResponse}</pre>
                </div>
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  {loading ? 'Loading...' : 'No raw response yet'}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="code">
              <div className="bg-muted p-4 rounded-md relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute right-2 top-2 h-8 gap-1"
                  onClick={() => copyToClipboard(fetchDirectCode)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </Button>
                <pre className="text-xs overflow-auto pt-8">{fetchDirectCode}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
