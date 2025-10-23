"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const registerFormSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  full_name: z.string().min(3, { message: "O nome completo é obrigatório." }),
  postal_code: z.string().min(8, { message: "O CEP deve ter 8 dígitos." }),
  address: z.string().min(1, { message: "O endereço é obrigatório." }),
  number_address: z.string().min(1, { message: "O número é obrigatório." }),
  address_complement: z.string().optional(),
  neighborhood: z.string().min(1, { message: "O bairro é obrigatório." }),
  city: z.string().min(1, { message: "A cidade é obrigatória." }),
  state: z.string().min(2, { message: "O estado é obrigatório." }),
})

export default function AuthPage() {
  const [isCepLoading, setIsCepLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      postal_code: "",
      address: "",
      number_address: "",
      address_complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  })

  const handleCepLookup = async (cep: string) => {
    const cleanedCep = cep.replace(/\D/g, '')
    if (cleanedCep.length !== 8) {
      return
    }

    setIsCepLoading(true)
    try {
      // ===== CORREÇÃO APLICADA AQUI =====
      // Adicionamos o cabeçalho 'Content-Type' para garantir que o servidor
      // entenda que estamos enviando um JSON.
      const { data, error } = await supabase.functions.invoke('cep-lookup', {
        body: { cep: cleanedCep },
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.error) {
        form.setError("postal_code", { message: data.error })
        toast.error(data.error)
      } else {
        form.setValue("address", data.logradouro || "")
        form.setValue("neighborhood", data.bairro || "")
        form.setValue("city", data.localidade || "")
        form.setValue("state", data.uf || "")
        form.clearErrors("postal_code")
        if (data.logradouro) {
          document.getElementById("number_address")?.focus()
        }
      }
    } catch (err: any) {
      toast.error("Falha ao buscar o CEP. Verifique o valor e tente novamente.")
      form.setError("postal_code", { message: "CEP inválido ou não encontrado." })
    } finally {
      setIsCepLoading(false)
    }
  }

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    setIsSubmitting(true)
    console.log("Dados do formulário:", values)
    toast.success("Cadastro enviado com sucesso! (Simulação)")
    setIsSubmitting(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Criar Nova Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="00000-000"
                            {...field}
                            onBlur={(e) => {
                              field.onBlur()
                              handleCepLookup(e.target.value)
                            }}
                          />
                          {isCepLoading && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin" />}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Avenida..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="number_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input id="number_address" placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address_complement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Apto, Bloco, etc. (Opcional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Sua cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="UF" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Cadastrando..." : "Criar Conta"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}