"use client";

export const dynamic = "force-dynamic";
export const runtime = "edge";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from "../../../../../lib/supabase/client";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../../components/ui/card";
import { Input, Label } from "../../../../../components/ui/input";
import { Select, SelectItem } from "../../../../../components/ui/select";
import { Textarea } from "../../../../../components/ui/textarea";
import { Settings, Save, Loader2, Sparkles, Building, Globe, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface AISettings {
  assistant_name?: string;
  voice_enabled?: boolean;
  model_type?: string;
  custom_prompt?: string;
  specialty?: string;
  enabled?: boolean;
  welcome_message?: string;
  scribe_enabled?: boolean;
}

interface Clinic {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  ai_settings: AISettings | null;
}

export default function ClinicSettingsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    ai_settings: {
      assistant_name: 'Vicky',
      voice_enabled: true,
      model_type: 'gemini-2.0-flash',
      custom_prompt: '',
      specialty: 'General'
    }
  });

  useEffect(() => {
    if (!slug) return;
    
    async function setup() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        toast.error('Clínica no encontrada');
        router.push('/dashboard');
        return;
      }

      setClinic(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        ai_settings: data.ai_settings || {
            assistant_name: 'Vicky',
            voice_enabled: true,
            model_type: 'gemini-2.0-flash',
            custom_prompt: '',
            specialty: 'General'
        }
      });
      setLoading(false);
    }
    
    Promise.resolve().then(() => setup());
  }, [slug, supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!clinic) return;
    const { error } = await supabase
      .from('clinics')
      .update({
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        ai_settings: formData.ai_settings
      })
      .eq('id', clinic.id);

    if (error) {
      toast.error('Error al guardar cambios: ' + error.message);
    } else {
      toast.success('Configuración actualizada correctamente');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Gestiona los detalles de la clínica y el asistente IA</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Perfil de la Clínica
            </CardTitle>
            <CardDescription>Información pública y de contacto</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Clínica</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email de Contacto</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="website" 
                    placeholder="https://..."
                    value={formData.website} 
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input 
                id="address" 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                placeholder="Breve descripción de la clínica y sus servicios..."
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Asistente IA (Medical Scribe)
            </CardTitle>
            <CardDescription>Personaliza el comportamiento del asistente virtual</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="assistant_name">Nombre del Asistente</Label>
                <Input 
                  id="assistant_name" 
                  value={formData.ai_settings.assistant_name} 
                  onChange={(e) => setFormData({
                    ...formData, 
                    ai_settings: { ...formData.ai_settings, assistant_name: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad Clínica</Label>
                <Select 
                  value={formData.ai_settings.specialty} 
                  onChange={(e) => setFormData({
                    ...formData, 
                    ai_settings: { ...formData.ai_settings, specialty: e.target.value }
                  })}
                >
                  <SelectItem value="General">Medicina General</SelectItem>
                  <SelectItem value="Pediatrics">Pediatría</SelectItem>
                  <SelectItem value="Cardiology">Cardiología</SelectItem>
                  <SelectItem value="Dermatology">Dermatología</SelectItem>
                  <SelectItem value="Mental Health">Salud Mental</SelectItem>
                  <SelectItem value="Other">Otra</SelectItem>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo de IA</Label>
                <Select 
                  value={formData.ai_settings.model_type} 
                  onChange={(e) => setFormData({
                    ...formData, 
                    ai_settings: { ...formData.ai_settings, model_type: e.target.value }
                  })}
                >
                  <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash (Más rápido)</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Más analítico)</SelectItem>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom_prompt">Instrucciones Personalizadas (Prompt Engine)</Label>
              <Textarea 
                id="custom_prompt" 
                placeholder="Ej: 'Siempre resume las alergias al principio' o 'Usa un tono formal'..."
                value={formData.ai_settings.custom_prompt} 
                onChange={(e) => setFormData({
                  ...formData, 
                  ai_settings: { ...formData.ai_settings, custom_prompt: e.target.value }
                })}
                className="min-h-[120px] font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground italic">
                Nota: Estas instrucciones se añadirán al sistema experto del Medical Scribe.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pb-10">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
