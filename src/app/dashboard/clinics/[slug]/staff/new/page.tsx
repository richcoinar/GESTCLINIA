'use client';

export const dynamic = "force-dynamic";
export const runtime = "edge";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from "../../../../../../lib/supabase/client";
import { Button } from "../../../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../../../components/ui/card";
import { Input, Label } from "../../../../../../components/ui/input";
import { Select, SelectItem } from "../../../../../../components/ui/select";
import { UserPlus, ArrowLeft, Loader2, Mail, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
interface Clinic {
  id: string;
  name: string;
}

export default function AddStaffPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinic, setClinic] = useState<Clinic | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'doctor',
    specialization: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('id, name')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setClinic(data as Clinic);
      } catch (err: unknown) {
        console.error('Error fetching clinic:', err);
        toast.error('Error al cargar la clínica');
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) fetchData();
  }, [slug, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.role) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!clinic) return;
      // In a real app, this would send an invite. For MVP, we insert directly.
      const { error } = await supabase
        .from('clinic_staff')
        .insert({
          clinic_id: clinic.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          role: formData.role,
          specialization: formData.specialization,
          status: 'active'
        });

      if (error) throw error;

      toast.success('Miembro del personal agregado correctamente');
      router.push(`/dashboard/clinics/${slug}?tab=staff`);
    } catch (err: unknown) {
      console.error('Error adding staff:', err);
      toast.error('Error al agregar al personal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Agregar Personal</h1>
          {clinic && <p className="text-muted-foreground">{clinic.name}</p>}
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>Los nuevos miembros del personal recibirán acceso al dashboard de esta clínica.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  placeholder="Ej: Javier"
                  className="bg-background/50 border-border/50"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellidos</Label>
                <Input
                  id="last_name"
                  placeholder="Ej: Méndez"
                  className="bg-background/50 border-border/50"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@clinica.com"
                  className="pl-10 bg-background/50 border-border/50"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select 
                  value={formData.role} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, role: e.target.value})}
                  className="bg-background/50 border-border/50 h-10"
                >
                  <SelectItem value="doctor">Médico / Especialista</SelectItem>
                  <SelectItem value="nurse">Enfermero/a</SelectItem>
                  <SelectItem value="admin">Administrador de Clínica</SelectItem>
                  <SelectItem value="receptionist">Recepcionista</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Especialidad (Opcional)</Label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="specialization"
                    placeholder="Ej: Cardiología"
                    className="pl-10 bg-background/50 border-border/50"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    disabled={formData.role !== 'doctor'}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/clinics/${slug}`)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Agregando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Agregar Miembro
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
