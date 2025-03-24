
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { classColors } from '@/utils/mockData';
import { Check, ArrowLeft } from 'lucide-react';

const CreateClass = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    subject: '',
    description: '',
    colorIndex: 0,
  });
  
  if (!currentUser || currentUser.role !== 'teacher') {
    navigate('/dashboard');
    return null;
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleColorChange = (index: number) => {
    setFormData(prev => ({ ...prev, colorIndex: index }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Class name is required.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Success!",
      description: `Class "${formData.name}" has been created.`,
    });
    
    navigate('/dashboard');
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
          Back to Dashboard
        </Button>
        
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl">Create Class</CardTitle>
            <CardDescription>
              Fill in the details to create a new class for your students.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  name="name"
                  placeholder="e.g., Introduction to Biology"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input 
                    id="section" 
                    name="section"
                    placeholder="e.g., Period 1"
                    value={formData.section}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    name="subject"
                    placeholder="e.g., Science"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  placeholder="Provide a description of your class..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Class Theme Color</Label>
                <div className="flex flex-wrap gap-3">
                  {classColors.map((color, index) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-12 h-12 rounded-full relative transition-transform ${
                        formData.colorIndex === index ? 'scale-110 shadow-md' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(index)}
                      aria-label={`Select color ${index + 1}`}
                    >
                      {formData.colorIndex === index && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="text-white h-6 w-6" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit">Create Class</Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default CreateClass;
