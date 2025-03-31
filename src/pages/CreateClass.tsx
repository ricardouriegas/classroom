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
// ... imports idénticos a los que tú pusiste (no los repetimos por espacio)
import { RiArrowLeftLine, RiCheckLine } from "react-icons/ri"; // reemplazo de íconos si deseas

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

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setCareersLoading(true);
        const response = await api.get('/careers');
        setCareers(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las carreras.",
          variant: "destructive",
        });
      } finally {
        setCareersLoading(false);
      }
    };
    fetchCareers();
  }, [toast]);

  if (!currentUser || currentUser.role !== 'teacher') {
    navigate('/dashboard');
    return null;
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await api.post('/classes', values);
      toast({
        title: "¡Éxito!",
        description: `La clase "${values.name}" ha sido creada.`,
      });
      navigate(`/class/${response.data.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error?.message || "Error al crear la clase.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#1E1E2F] text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6 text-[#00ffc3] hover:bg-[#00ffc3]/10"
          onClick={() => navigate('/dashboard')}
        >
          <RiArrowLeftLine className="mr-2 h-5 w-5" />
          Volver al Panel
        </Button>

        <Card className="bg-[#1e1e2f]/80 border border-[#4c4c6d] backdrop-blur-sm shadow-xl animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl text-[#00ffc3]">Crear Clase</CardTitle>
            <CardDescription className="text-gray-400">
              Llena los datos para crear una nueva clase.
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
                      <FormLabel className="text-white">Nombre de la Clase <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          className="bg-[#2f2f42] border border-[#4c4c6d] focus:border-[#00ffc3] focus:ring-[#00ffc3] text-white"
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
                        <FormLabel className="text-white">Carrera <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={careersLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-[#2f2f42] border-[#4c4c6d] text-white focus:border-[#00ffc3] focus:ring-[#00ffc3]">
                              <SelectValue placeholder="Seleccione una carrera" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#2f2f42] text-white border-[#4c4c6d]">
                            {careersLoading ? (
                              <SelectItem value="loading" disabled>Cargando...</SelectItem>
                            ) : careers.length === 0 ? (
                              <SelectItem value="none" disabled>No hay carreras</SelectItem>
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
                        <FormLabel className="text-white">Cuatrimestre <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: 2023-B"
                            className="bg-[#2f2f42] border border-[#4c4c6d] focus:border-[#00ffc3] focus:ring-[#00ffc3] text-white"
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
                      <FormLabel className="text-white">Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          className="bg-[#2f2f42] border border-[#4c4c6d] focus:border-[#00ffc3] focus:ring-[#00ffc3] text-white min-h-[100px]"
                          placeholder="Breve descripción de la clase..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        Opcional: describe los temas, objetivos u otra información relevante.
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
                  className="border-[#0F0C29] text-[#0F0C29] hover:bg-[#00ffc3]/10"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#00ffc3] text-black hover:bg-[#00ffc3]/90 transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Creando...
                    </span>
                  ) : (
                    <>
                      <RiCheckLine className="mr-2 h-4 w-4" />
                      Crear Clase
                    </>
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


