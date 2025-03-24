
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, User, LockKeyhole, Mail } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Modify email to reflect role for demo purposes
      const loginEmail = role === 'teacher' ? `teacher_${email}` : email;
      
      await login(loginEmail, password);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDemoLogin = async (role: 'student' | 'teacher') => {
    try {
      setIsLoading(true);
      
      const demoEmail = role === 'teacher' ? 'teacher@example.com' : 'student@example.com';
      const demoPassword = 'password123';
      
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Demo Login Failed",
        description: "There was an error with the demo login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">ClassConnect</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="demo">Demo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="role">I am a:</Label>
                      <div className="flex rounded-md overflow-hidden border">
                        <Button 
                          type="button"
                          variant={role === 'student' ? 'default' : 'outline'}
                          className={`rounded-none ${role === 'student' ? '' : 'border-0'}`}
                          onClick={() => setRole('student')}
                        >
                          Student
                        </Button>
                        <Button 
                          type="button"
                          variant={role === 'teacher' ? 'default' : 'outline'}
                          className={`rounded-none ${role === 'teacher' ? '' : 'border-0'}`}
                          onClick={() => setRole('teacher')}
                        >
                          Teacher
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email"
                        className="pl-10" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Enter your password"
                        className="pl-10" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="demo">
              <CardContent className="space-y-4">
                <div className="text-center text-sm text-gray-600 mb-4">
                  Choose a demo account to quickly try out the application.
                </div>
                
                <div className="grid gap-4">
                  <Button
                    variant="outline"
                    className="border-blue-200 bg-blue-50 hover:bg-blue-100 p-6 h-auto flex items-center justify-center"
                    onClick={() => handleDemoLogin('student')}
                    disabled={isLoading}
                  >
                    <div className="flex flex-col items-center">
                      <User className="h-6 w-6 mb-2 text-blue-600" />
                      <span className="font-medium">Student Demo</span>
                      <span className="text-xs text-gray-500 mt-1">Access the student experience</span>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="border-purple-200 bg-purple-50 hover:bg-purple-100 p-6 h-auto flex items-center justify-center"
                    onClick={() => handleDemoLogin('teacher')}
                    disabled={isLoading}
                  >
                    <div className="flex flex-col items-center">
                      <BookOpen className="h-6 w-6 mb-2 text-purple-600" />
                      <span className="font-medium">Teacher Demo</span>
                      <span className="text-xs text-gray-500 mt-1">Access the teacher experience</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
