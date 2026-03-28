"use client";

export const dynamic = "force-dynamic";
export const runtime = "edge";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '../../../../../../lib/supabase/client';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../../../components/ui/card';
import { Input, Label } from '../../../../../../components/ui/input';
import { Select, SelectItem } from '../../../../../../components/ui/select';
import { Textarea } from '../../../../../../components/ui/textarea';
import { Calendar, Clock, ArrowLeft, Save, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Clinic {
  id: string;
  name: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_date: '',
    appointment_time: '',
    service_name: '',
    status: 'scheduled',
    notes: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch clinic
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .select('id, name')
          .eq('slug', slug)
          .single();

        if (clinicError) throw clinicError;
        setClinic(clinicData as Clinic);

        // Fetch patients
        const { data: patientsData, error: patientsError } = await supabase
          .from('clinic_patients')
          .select('id, first_name, last_name')
          .eq('clinic_id', (clinicData as Clinic).id);

        if (patientsError) throw patientsError;
        setPatients(patientsData as Patient[] || []);
      } catch (err: unknown) {
        console.error('Error fetching data:', err);
        toast.error('Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) fetchData();
  }, [slug, supabase]);

  const filteredPatients = patients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.appointment_date || !formData.appointment_time) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!clinic) return;
      
      // Combine date and time
      const startTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`);
      const endTime = new Date(startTime.getTime() + 30 * 60000); // Default 30 mins

      const { error } = await supabase
        .from('clinic_appointments')
        .insert({
          clinic_id: clinic.id,
          patient_id: formData.patient_id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          service_name: formData.service_name,
          status: formData.status,
          notes: formData.notes
        });

      if (error) throw error;

      toast.success('Cita agendada correctamente');
      router.push(`/dashboard/clinics/${slug}?tab=appointments`);
    } catch (err: unknown) {
      console.error('Error saving appointment:', err);
      toast.error('Error al agendar la cita');
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Agendar Nueva Cita</h1>
          {clinic && <p className="text-muted-foreground">{clinic.name}</p>}
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Detalles de la Cita</CardTitle>
          <CardDescription>Completa la información para programar la visita del paciente.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Selection */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="patient">Paciente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar paciente..." 
                    className="pl-10 mb-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select 
                  value={formData.patient_id} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, patient_id: e.target.value})}
                  className="bg-background/50 border-border/50 h-10"
                >
                  <option value="" disabled>Seleccionar paciente</option>
                  {filteredPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </option>
                  ))}
                </Select>
                <div className="flex justify-end mt-1">
                  <Link href={`/dashboard/clinics/${slug}/patients/new`} className="text-xs text-primary hover:underline">
                    + Registrar nuevo paciente
                  </Link>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-10 h-12 bg-background/50 border-border/50"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    className="pl-10 h-12 bg-background/50 border-border/50"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Service Name / Reason */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="service_name">Motivo de Consulta / Servicio</Label>
                <Input
                  id="service_name"
                  placeholder="Ej: Control prenatal, Dolor abdominal, etc."
                  className="h-12 bg-background/50 border-border/50"
                  value={formData.service_name}
                  onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                />
              </div>

              {/* Status */}
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="status">Estado Inicial</Label>
                <Select 
                  value={formData.status} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, status: e.target.value})}
                  className="h-10 bg-background/50 border-border/50"
                >
                  <SelectItem value="scheduled">Programada</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="arrived">En Sala</SelectItem>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notas adicionales / Comentarios</Label>
                <Textarea
                  id="notes"
                  placeholder="Instrucciones especiales para el personal o el médico..."
                  className="min-h-[100px] bg-background/50 border-border/50 resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
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
                    Agendando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Agendar Cita
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
