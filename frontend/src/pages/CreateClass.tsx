import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Check } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define form validation schema
const formSchema = z.object({
  name: z.string().min(3, { message: 'El nombre de la clase debe tener al menos 3 caracteres' }),
  description: z.string().optional(),
  career_id: z.string({ required_error: 'Seleccione una carrera' }),
  semester: z.string().min(1, { message: 'Ingrese el cuatrimestre' }),
});

type Career = {
  id: string;
  name: string;
};

const CreateClass = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [careers, setCareers] = useState<Career[]>([]);
  const [careersLoading, setCareersLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      semester: '',
    },
  });
  
  // Fetch careers when component mounts
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setCareersLoading(true);
        // Fetch careers from API instead of using mock data
        const response = await api.get('/careers');
        setCareers(response.data);
      } catch (error) {
        console.error('Error fetching careers:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las carreras. Por favor, inténtelo de nuevo.",
          variant: "destructive",
        });
      } finally {
        setCareersLoading(false);
      }
    };
    
    fetchCareers();
  }, [toast]);
  
  // Check if user is a teacher, otherwise redirect
  if (!currentUser || currentUser.role !== 'teacher') {
    navigate('/dashboard');
    return null;
  }
  
  // Submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // Call backend API to create class
      const response = await api.post('/classes', values);
      
      toast({
        title: "¡Éxito!",
        description: `La clase "${values.name}" ha sido creada correctamente.`,
      });
      
      // Redirect to the new class page
      navigate(`/class/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error?.message || "Ocurrió un error al crear la clase. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Panel
        </Button>
        
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl">Crear Clase</CardTitle>
            <CardDescription>
              Complete los detalles para crear una nueva clase para sus estudiantes.
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Clase <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Programación Web"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="career_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carrera <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={careersLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una carrera" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {careersLoading ? (
                              <SelectItem value="loading" disabled>Cargando carreras...</SelectItem>
                            ) : careers.length === 0 ? (
                              <SelectItem value="none" disabled>No hay carreras disponibles</SelectItem>
                            ) : (
                              careers.map((career) => (
                                <SelectItem key={career.id} value={career.id}>
                                  {career.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuatrimestre <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: 2023-B"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción del curso, objetivos, etc."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Proporcione una descripción para ayudar a los estudiantes a entender el contenido de la clase.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando...
                    </span>
                  ) : (
                    "Crear Clase"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
};

export default CreateClass;
