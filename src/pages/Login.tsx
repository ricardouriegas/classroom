import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, LockKeyhole, Mail } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const validateForm = () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!password) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu contraseña.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/dashboard');
      toast({
        title: "Inicio de Sesión Exitoso",
        description: "Has ingresado correctamente.",
      });
    } catch (error: any) {
      let errorMessage = "Error al iniciar sesión. Por favor intenta de nuevo.";
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.error?.message || errorMessage;
      }
      
      toast({
        title: "Error de Inicio de Sesión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#1E1E2F] p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 rounded-xl bg-[#00ffc3] flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-[#1E1E2F]" />
          </div>
        </div>
        
        <Card className="bg-[#1E1E2F]/80 border border-[#4c4c6d] shadow-lg text-white">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-[#00ffc3]">Classroom</CardTitle>
            <CardDescription className="text-gray-300">Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Ingresa tu email"
                    className="pl-10 bg-[#252538] border-[#4c4c6d] text-white placeholder:text-gray-500" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Contraseña</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Ingresa tu contraseña"
                    className="pl-10 bg-[#252538] border-[#4c4c6d] text-white placeholder:text-gray-500" 
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
                className="w-full bg-[#00ffc3] text-[#1E1E2F] hover:bg-[#00ffc3]/90" 
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
