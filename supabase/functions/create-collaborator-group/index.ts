// @ts-expect-error - Importado em tempo de execução pelo ambiente Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendWelcomeMessage } from "../_shared/whatsapp-messages.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    const { unit_code, grupo, phones } = await req.json();
    console.log("=== INÍCIO: create-collaborator-group ===");
    console.log("Dados recebidos:", {
      unit_code,
      grupo,
      unit_code_type: typeof unit_code,
    });
    if (!grupo) {
      throw new Error("Grupo is required");
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }
    // @ts-expect-error - Resolução de tipos delegada ao ambiente de execução
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabasePublic = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseTreinamento = createClient(supabaseUrl, supabaseServiceKey, {
      db: {
        schema: "treinamento",
      },
    });
    // Converter unit_code para número se necessário
    const unitCodeNumber =
      typeof unit_code === "string" ? parseInt(unit_code, 10) : unit_code;
    console.log("Unit code convertido para número:", unitCodeNumber);
    // Verificar se a unidade já tem um grupo de colaboradores
    console.log("Verificando se unidade já tem grupo...");
    const { data: publicUnit, error: publicUnitError } = await supabasePublic
      .from("unidades")
      .select("id, group_code, group_name")
      .eq("group_code", unitCodeNumber)
      .maybeSingle();
    if (publicUnitError) {
      console.error("Erro ao buscar unidade (public):", publicUnitError);
      throw new Error(
        `Erro ao buscar unidade (public): ${publicUnitError.message}`
      );
    }
    if (!publicUnit) {
      console.error("Unidade não encontrada para código:", unit_code);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Unidade com código ${unit_code} não encontrada no sistema.`,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 404,
        }
      );
    }
    const { data: publicGroup, error: publicGroupError } = await supabasePublic
      .from("unidades_grupos_whatsapp")
      .select("group_id")
      .eq("unit_id", publicUnit.id)
      .eq("kind", "colab")
      .maybeSingle();
    if (publicGroupError) {
      console.error(
        "Erro ao verificar grupo existente (public):",
        publicGroupError
      );
      throw new Error(
        `Erro ao verificar grupo existente (public): ${publicGroupError.message}`
      );
    }
    const existingGroupId = publicGroup?.group_id ?? null;
    console.log("Unidade encontrada:", {
      codigo_grupo: publicUnit.group_code,
      group_name: publicUnit.group_name,
      grupo_colaborador: existingGroupId,
    });
    
    // Obter credenciais ZAPI antes de qualquer operação
    const zapiToken = Deno.env.get("ZAPI_INSTANCE_TOKEN_TREINAMENTO");
    const zapiInstanceId = Deno.env.get("ZAPI_INSTANCE_ID_TREINAMENTO");
    const zapiClientToken = Deno.env.get("ZAPI_CLIENT_TOKEN_TREINAMENTO");
    if (!zapiToken || !zapiInstanceId || !zapiClientToken) {
      throw new Error("ZAPI credentials not configured");
    }
    
    // Definir função de sanitização de telefone
    const sanitizePhone = (value: unknown): string | null => {
      if (typeof value !== "string") return null;
      const digits = value.replace(/\D/g, "");
      if (!digits) return null;
      return digits.startsWith("55") ? digits : `55${digits}`;
    };
    
    // Se já existe grupo, adicionar apenas novos participantes
    if (existingGroupId) {
      console.log("✅ Grupo existente encontrado:", existingGroupId);
      console.log("Adicionando novos participantes ao grupo existente...");
      
      // Buscar participantes atuais do grupo via Z-API
      let currentParticipants: string[] = [];
      try {
        const groupInfoResponse = await fetch(
          `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/group-metadata/${existingGroupId}`,
          {
            method: "GET",
            headers: {
              "Client-Token": zapiClientToken,
            },
          }
        );
        
        if (groupInfoResponse.ok) {
          const groupInfo = await groupInfoResponse.json();
          console.log("Informações do grupo:", groupInfo);
          
          // Extrair telefones dos participantes atuais
          if (groupInfo.participants && Array.isArray(groupInfo.participants)) {
            currentParticipants = groupInfo.participants.map((p: { id?: string; phone?: string } | string) => {
              // Normalizar formato do telefone (remover @s.whatsapp.net se houver)
              const phone = typeof p === 'string' ? p : p.id || p.phone || '';
              return phone.replace('@s.whatsapp.net', '').replace('@c.us', '');
            });
            console.log("Participantes atuais do grupo:", currentParticipants);
          }
        } else {
          console.warn("Não foi possível obter metadados do grupo, continuando sem filtrar duplicados");
        }
      } catch (metadataError) {
        console.warn("Erro ao buscar metadados do grupo:", metadataError);
        console.log("Continuando sem filtrar duplicados...");
      }
      
      // Coletar apenas os novos telefones para adicionar
      const requestPhones = Array.isArray(phones) ? phones : [];
      const sanitizedPayloadPhones = requestPhones
        .map(sanitizePhone)
        .filter((phone): phone is string => !!phone)
        .filter(phone => !currentParticipants.includes(phone));
      
      console.log("Novos telefones para adicionar:", sanitizedPayloadPhones);
      
      if (sanitizedPayloadPhones.length === 0) {
        console.log("⚠️ Nenhum novo telefone para adicionar");
        return new Response(
          JSON.stringify({
            success: true,
            message: "Grupo já existe e não há novos participantes para adicionar",
            groupId: existingGroupId,
            participants: {
              added: [],
              warnings: [],
              errors: [],
            },
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 200,
          }
        );
      }
      
      // Adicionar novos participantes usando a edge function auxiliar
      const addResults = {
        success: [] as string[],
        warnings: [] as string[],
        errors: [] as string[],
      };
      
      const addCollaboratorEndpoint = `${supabaseUrl}/functions/v1/add-collaborator-to-group`;
      
      for (const newPhone of sanitizedPayloadPhones) {
        try {
          const addResponse = await fetch(addCollaboratorEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseServiceKey ?? "",
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              groupId: existingGroupId,
              phone: newPhone,
              name: "Novo Participante",
            }),
          });
          
          const addText = await addResponse.text();
          let addResult;
          try {
            addResult = JSON.parse(addText);
          } catch {
            console.error(`Invalid JSON response for ${newPhone}:`, addText);
            addResults.errors.push(`Telefone ${newPhone}`);
            continue;
          }
          
          if (!addResponse.ok) {
            console.error(`Failed to add ${newPhone}:`, addText);
            addResults.errors.push(`Telefone ${newPhone}`);
          } else if (addResult.warning) {
            console.warn(`Warning adding ${newPhone}:`, addResult.message);
            addResults.warnings.push(`Telefone ${newPhone}: ${addResult.message}`);
          } else {
            console.log(`✅ ${newPhone} added successfully`);
            addResults.success.push(`Telefone ${newPhone}`);
          }
        } catch (addError) {
          console.error(`Error adding ${newPhone}:`, addError);
          addResults.errors.push(`Telefone ${newPhone}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      console.log("Resultados da adição:", addResults);
      
      let responseMessage = "Novos participantes adicionados ao grupo existente";
      if (addResults.success.length > 0) {
        responseMessage += `\n✅ Adicionados: ${addResults.success.length}`;
      }
      if (addResults.warnings.length > 0) {
        responseMessage += `\n⚠️ Avisos: ${addResults.warnings.length}`;
      }
      if (addResults.errors.length > 0) {
        responseMessage += `\n❌ Erros: ${addResults.errors.length}`;
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: responseMessage,
          groupId: existingGroupId,
          groupName: publicUnit.group_name || `COLAB - ${unit_code}`,
          participants: addResults,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }
    
    // Buscar telefone do franqueado para adicionar como participante inicial
    // O franqueado pode ter esta unidade como principal (unit_code) ou secundária (unit_codes)
    console.log("🔍 Buscando franqueado para unit_code:", unit_code);
    
    const { data: franchisees, error: franchiseeError } = await supabaseTreinamento
      .from("users")
      .select("phone, name, unit_code, unit_codes")
      .eq("role", "Franqueado")
      .eq("active", true)
      .not("phone", "is", null);

    if (franchiseeError) {
      console.error("Erro ao buscar franqueados:", franchiseeError);
    }

    console.log("Franqueados encontrados:", franchisees?.length || 0);
    
    // Encontrar TODOS os franqueados que têm acesso a esta unidade
    const unitFranchisees = franchisees?.filter((f: { name?: string; phone?: string; unit_code?: string; unit_codes?: string[] }) => {
      // Verificar se a unidade é a principal
      if (f.unit_code === unit_code) {
        console.log(`✅ Franqueado ${f.name || 'Sem nome'} tem ${unit_code} como unidade principal`);
        return true;
      }
      
      // Verificar se a unidade está nas secundárias
      if (Array.isArray(f.unit_codes) && f.unit_codes.includes(unit_code)) {
        console.log(`✅ Franqueado ${f.name || 'Sem nome'} tem ${unit_code} nas unidades secundárias`);
        return true;
      }
      
      return false;
    }) || [];

    if (unitFranchisees.length === 0) {
      console.warn("⚠️ Nenhum franqueado encontrado com acesso à unidade:", unit_code);
    } else {
      console.log(`✅ ${unitFranchisees.length} franqueado(s) identificado(s) para a unidade:`, 
        unitFranchisees.map((f: { name?: string; phone?: string }) => ({
          name: f.name,
          phone: f.phone
        }))
      );
    }

    // Número padrão que sempre será adicionado aos grupos
    const defaultPhone = "5511940477721";
    const girabotPhone = "5519993808900";
    const treinamentoPhone = "5519993808685";

    const requestPhones = Array.isArray(phones) ? phones : [];
    const sanitizedPayloadPhones = requestPhones
      .map(sanitizePhone)
      .filter((phone): phone is string => !!phone);

    // Criar grupo com pelo menos 2 participantes para evitar erro "participants not found"
    const createGroupPrimaryPhone = treinamentoPhone;
    const createGroupPhones = [createGroupPrimaryPhone, defaultPhone];

    console.log("Phones para criação do grupo:", createGroupPhones);

    const phoneMetadata = new Map<string, { name: string; promote: boolean }>();
    phoneMetadata.set(treinamentoPhone, {
      name: "Equipe Treinamento",
      promote: true,
    });
    phoneMetadata.set(defaultPhone, {
      name: "Central Cresci",
      promote: true,
    });
    phoneMetadata.set(girabotPhone, {
      name: "Girabot",
      promote: true,
    });

    for (const phone of sanitizedPayloadPhones) {
      if (!phoneMetadata.has(phone)) {
        phoneMetadata.set(phone, {
          name: "Participante",
          promote: true,
        });
      }
    }
    
    // Adicionar TODOS os franqueados da unidade
    console.log(`Adicionando ${unitFranchisees.length} franqueado(s) ao grupo...`);
    for (const franchisee of unitFranchisees) {
      if (franchisee?.phone) {
        const cleanPhone = franchisee.phone.replace(/\D/g, "");
        const fullPhone = cleanPhone.startsWith("55")
          ? cleanPhone
          : `55${cleanPhone}`;
        
        console.log("Processando franqueado:", {
          name: franchisee.name,
          originalPhone: franchisee.phone,
          cleanPhone: cleanPhone,
          fullPhone: fullPhone,
        });
        
        if (fullPhone !== treinamentoPhone && fullPhone !== defaultPhone) {
          phoneMetadata.set(fullPhone, {
            name: franchisee.name ?? "Franqueado",
            promote: false,
          });
          console.log(`✅ Franqueado ${franchisee.name} adicionado ao metadata`);
        } else {
          console.log(`⚠️ Telefone do franqueado ${franchisee.name} é igual a um número padrão, não será adicionado novamente`);
        }
      } else {
        console.log(`⚠️ Franqueado ${franchisee.name || 'Sem nome'} não tem telefone cadastrado`);
      }
    }
    
    console.log("=== RESUMO DE PARTICIPANTES ===");
    console.log("Total de participantes no metadata:", phoneMetadata.size);
    console.log("Participantes detalhados:");
    for (const [phone, meta] of phoneMetadata.entries()) {
      console.log(`  - ${phone}: ${meta.name} (admin: ${meta.promote})`);
    }
    console.log("===============================");
    
    const resolvedGroupName =
      grupo || publicUnit.group_name || String(unit_code);
    const groupName = `COLAB - ${resolvedGroupName}`;
    
    const zapiPayload = {
      groupName: groupName,
      autoInvite: true,
      phones: createGroupPhones,
    };
    
    console.log(
      "Creating WhatsApp group:",
      groupName,
      "with phones:",
      createGroupPhones
    );
    console.log("ZAPI payload completo:", JSON.stringify(zapiPayload, null, 2));
    
    // Criar grupo com participantes iniciais
    const zapiResponse = await fetch(
      `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/create-group`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Token": zapiClientToken,
        },
        body: JSON.stringify(zapiPayload),
      }
    );
    const responseText = await zapiResponse.text();
    console.log("ZAPI response status:", zapiResponse.status);
    console.log("ZAPI response text:", responseText);
    if (!zapiResponse.ok) {
      console.error("ZAPI error response:", responseText);
      // Verificar se é erro de grupo duplicado
      if (
        responseText.includes("already exists") ||
        responseText.includes("já existe")
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              "Um grupo com este nome já existe no WhatsApp. Por favor, use um nome diferente ou remova o grupo existente primeiro.",
            zapiError: responseText,
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 400,
          }
        );
      }
      throw new Error(`Failed to create WhatsApp group: ${responseText}`);
    }
    let zapiResult;
    try {
      zapiResult = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse ZAPI response:", responseText);
      throw new Error(`Invalid JSON response from ZAPI: ${responseText}`);
    }
    console.log("ZAPI group creation response:", zapiResult);
    if (zapiResult?.success === false) {
      console.error("ZAPI group creation indicated failure:", zapiResult);
      throw new Error(zapiResult.message || "Failed to create WhatsApp group");
    }
    const groupId = zapiResult.phone || zapiResult.groupId || zapiResult.id;
    if (!groupId) {
      console.error("No group ID in ZAPI response:", zapiResult);
      throw new Error("Failed to get group ID from ZAPI response");
    }
    // Aguardar 2 segundos para o grupo ser criado completamente
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Buscando colaboradores aprovados da unidade...");
    const { data: approvedCollaborators, error: colabError } =
      await supabaseTreinamento
        .from("users")
        .select("phone, name")
        .eq("unit_code", unit_code)
        .eq("role", "Colaborador")
        .eq("approval_status", "aprovado")
        .eq("active", true)
        .not("phone", "is", null)
        .neq("phone", "");

    if (colabError) {
      console.error("Erro ao buscar colaboradores aprovados:", colabError);
    } else if (approvedCollaborators && approvedCollaborators.length > 0) {
      console.log(
        `Encontrados ${approvedCollaborators.length} colaboradores aprovados para adicionar`
      );
      for (const colaborador of approvedCollaborators) {
        const cleanPhone = colaborador.phone.replace(/\D/g, "");
        const fullPhone = cleanPhone.startsWith("55")
          ? cleanPhone
          : `55${cleanPhone}`;
        if (fullPhone === createGroupPrimaryPhone) {
          continue;
        }
        const existingMeta = phoneMetadata.get(fullPhone);
        phoneMetadata.set(fullPhone, {
          name: colaborador.name ?? existingMeta?.name ?? "Colaborador",
          promote: false,
        });
      }
    } else {
      console.log("Nenhum colaborador aprovado encontrado além dos iniciais");
    }

    // Filtrar participantes que já foram adicionados na criação do grupo
    const participantEntries = Array.from(phoneMetadata.entries()).filter(
      ([phone]) => !createGroupPhones.includes(phone)
    );

    const addCollaboratorEndpoint = `${supabaseUrl}/functions/v1/add-collaborator-to-group`;
    console.log(
      "Adding participants via add-collaborator-to-group:",
      participantEntries.map(([phone]) => phone)
    );

    const addResults = {
      success: [] as string[],
      warnings: [] as string[],
      errors: [] as string[],
    };

    for (const [participantPhone, meta] of participantEntries) {
      try {
        const addResponse = await fetch(addCollaboratorEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseServiceKey ?? "",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            groupId,
            phone: participantPhone,
            name: meta.name ?? "Participante",
            skipWelcomeMessage: true, // Não enviar mensagem agora, será enviada no final
          }),
        });

        const addText = await addResponse.text();
        let addResult;
        try {
          addResult = JSON.parse(addText);
        } catch {
          console.error(`Invalid JSON response for ${participantPhone}:`, addText);
          addResults.errors.push(`${meta.name} (${participantPhone})`);
          continue;
        }

        if (!addResponse.ok) {
          console.error(
            `Failed to add participant ${participantPhone}:`,
            addText
          );
          addResults.errors.push(`${meta.name} (${participantPhone})`);
        } else if (addResult.warning) {
          console.warn(
            `Warning adding ${participantPhone}:`,
            addResult.message
          );
          addResults.warnings.push(`${meta.name} (${participantPhone}): ${addResult.message}`);
        } else {
          console.log(
            `✅ Participant ${participantPhone} added successfully`
          );
          addResults.success.push(`${meta.name} (${participantPhone})`);
        }
      } catch (addError) {
        console.error(
          `Error calling add-collaborator-to-group for ${participantPhone}:`,
          addError
        );
        addResults.errors.push(`${meta.name} (${participantPhone})`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("Resultados da adição de participantes:", addResults);

    // Aguardar mais 2 segundos antes de promover admins
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const adminsQueue = Array.from(phoneMetadata.entries())
      .filter(([, meta]) => meta.promote)
      .map(([phone]) => phone);
    console.log("Promoting admins:", adminsQueue);

    if (adminsQueue.length > 0) {
      try {
        const promotePayload = {
          groupId: groupId,
          phones: adminsQueue,
        };
        
        console.log("Add admin payload:", JSON.stringify(promotePayload, null, 2));
        
        const promoteResponse = await fetch(
          `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/add-admin`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Client-Token": zapiClientToken,
            },
            body: JSON.stringify(promotePayload),
          }
        );
        
        const promoteText = await promoteResponse.text();
        console.log("Add admin response:", promoteText);
        
        if (!promoteResponse.ok) {
          console.error(`Failed to promote admins:`, promoteText);
        } else {
          console.log(`✅ Successfully promoted ${adminsQueue.length} admins`);
        }
      } catch (promoteError) {
        console.error(`Error promoting admins:`, promoteError);
      }
    }
    // Aguardar 2 segundos antes de definir foto
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Definir foto do grupo
    console.log("Setting group photo...");
    try {
      // Buscar a imagem do storage e converter para base64
      const imageResponse = await fetch(
        "https://yhjwdoiaafaajhlsxoyt.supabase.co/storage/v1/object/public/group-assets/perfil.webp"
      );
      if (!imageResponse.ok) {
        throw new Error("Failed to fetch group avatar image");
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      
      // Converter para base64 sem causar stack overflow
      const uint8Array = new Uint8Array(imageBuffer);
      let binaryString = '';
      const chunkSize = 8192; // Processar em chunks para evitar stack overflow
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
        binaryString += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const base64Image = btoa(binaryString);
      const imageDataUrl = `data:image/webp;base64,${base64Image}`;
      const photoResponse = await fetch(
        `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/update-group-photo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-Token": zapiClientToken,
          },
          body: JSON.stringify({
            groupId: groupId,
            groupPhoto: imageDataUrl,
          }),
        }
      );
      if (!photoResponse.ok) {
        console.error(
          "Failed to set group photo, but group was created:",
          await photoResponse.text()
        );
      } else {
        console.log("Successfully set group photo");
      }
    } catch (photoError) {
      console.error("Error setting group photo:", photoError);
      // Não lançar erro aqui - grupo já foi criado com sucesso
    }
    
    // Configurar grupo para apenas admins enviarem mensagens
    console.log("Configuring group settings (admin only)...");
    try {
      const settingsPayload = {
        phone: groupId,
        adminOnlyMessage: true,
        adminOnlySettings: true,
        adminOnlyAddMember: true,
      };
      
      console.log("Group settings payload:", JSON.stringify(settingsPayload, null, 2));
      
      const settingsResponse = await fetch(
        `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/update-group-settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-Token": zapiClientToken,
          },
          body: JSON.stringify(settingsPayload),
        }
      );
      
      const settingsText = await settingsResponse.text();
      console.log("Update settings response:", settingsText);
      
      if (!settingsResponse.ok) {
        console.error("Failed to update group settings:", settingsText);
      } else {
        console.log("✅ Successfully configured group settings (admin only)");
      }
    } catch (settingsError) {
      console.error("Error updating group settings:", settingsError);
      // Não lançar erro aqui - grupo já foi criado com sucesso
    }
    
    // Enviar mensagem de boas-vindas no grupo
    console.log("Enviando mensagem de boas-vindas no grupo...");
    try {
      const welcomeResult = await sendWelcomeMessage(groupId);
      if (welcomeResult.success) {
        console.log("✅ Mensagem de boas-vindas enviada com sucesso!");
      } else {
        console.warn("⚠️ Não foi possível enviar mensagem de boas-vindas:", welcomeResult.error);
      }
    } catch (welcomeError) {
      console.error("❌ Erro ao enviar mensagem de boas-vindas:", welcomeError);
      // Não lançar erro aqui - grupo já foi criado com sucesso
    }
    
    const { error: upsertGroupError } = await supabasePublic
      .from("unidades_grupos_whatsapp")
      .upsert(
        {
          unit_id: publicUnit.id,
          kind: "colab",
          group_id: groupId,
        },
        {
          onConflict: "unit_id,kind",
        }
      );
    if (upsertGroupError) {
      console.error(
        "❌ Erro ao registrar grupo em unidades_grupos_whatsapp:",
        upsertGroupError
      );
      throw new Error(
        `Failed to register WhatsApp group: ${upsertGroupError.message}`
      );
    }
    console.log(
      "Grupo registrado para unidade na tabela public.unidades_grupos_whatsapp."
    );
    console.log(`✅ Grupo criado com sucesso!`);
    console.log(`   - ID: ${groupId}`);
    console.log(`   - Nome: ${groupName}`);
    console.log(`   - Unidade atualizada: ${unitCodeNumber}`);
    console.log("=== FIM: create-collaborator-group ===");
    
    // Montar mensagem de resposta com detalhes
    let responseMessage = "Grupo de colaboradores criado com sucesso";
    if (addResults.success.length > 0) {
      responseMessage += `\n✅ Adicionados: ${addResults.success.length}`;
    }
    if (addResults.warnings.length > 0) {
      responseMessage += `\n⚠️ Avisos: ${addResults.warnings.length}`;
    }
    if (addResults.errors.length > 0) {
      responseMessage += `\n❌ Erros: ${addResults.errors.length}`;
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: responseMessage,
        groupId: groupId,
        groupName: groupName,
        participants: {
          added: addResults.success,
          warnings: addResults.warnings,
          errors: addResults.errors,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error in create-collaborator-group function:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
