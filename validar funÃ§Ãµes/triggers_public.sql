 CREATE TRIGGER update_role_table_permissions_updated_at BEFORE UPDATE ON public.role_table_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();         +
 
 CREATE TRIGGER notify_unidades_grupos_whatsapp_changes AFTER INSERT OR DELETE OR UPDATE ON public.unidades_grupos_whatsapp FOR EACH ROW EXECUTE FUNCTION notify_table_changes();+
 
 CREATE TRIGGER notify_franqueados_unidades_changes AFTER INSERT OR DELETE OR UPDATE ON public.franqueados_unidades FOR EACH ROW EXECUTE FUNCTION notify_table_changes();        +
 
 CREATE TRIGGER set_updated_at_franqueados_unidades BEFORE UPDATE ON public.franqueados_unidades FOR EACH ROW EXECUTE FUNCTION set_updated_at();                                 +
 
 CREATE TRIGGER colaboradores_loja_changes_trigger AFTER INSERT OR DELETE OR UPDATE ON public.colaboradores_loja FOR EACH ROW EXECUTE FUNCTION notify_table_changes();           +
 
 CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.colaboradores_loja FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();                                                     +
 
 CREATE TRIGGER notify_profiles_changes AFTER INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION notify_table_changes();                                +
 
 CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();                                          +
 
 CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.senhas FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();                                                                 +
 
 CREATE TRIGGER clientes_changes_trigger AFTER INSERT OR DELETE OR UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION notify_table_changes();                               +
 
 CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();                                                               +
 
 CREATE TRIGGER update_permission_tables_updated_at BEFORE UPDATE ON public.permission_tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();                   +
 
 CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clientes_filhos FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();                                                        +
 
 CREATE TRIGGER colaboradores_interno_changes_trigger AFTER INSERT OR DELETE OR UPDATE ON public.colaboradores_interno FOR EACH ROW EXECUTE FUNCTION notify_table_changes();     +
 
 CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.colaboradores_interno FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();                                                  +
 
 CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.franqueados_filhos FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();                                                     +
 
 CREATE TRIGGER update_user_table_permissions_updated_at BEFORE UPDATE ON public.user_table_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();         +
 
 CREATE TRIGGER notify_unidades_changes AFTER INSERT OR DELETE OR UPDATE ON public.unidades FOR EACH ROW EXECUTE FUNCTION notify_table_changes();                                +
 
 CREATE TRIGGER on_unidades_change AFTER INSERT OR UPDATE ON public.unidades FOR EACH ROW EXECUTE FUNCTION notify_webhook();                                                     +
 
 CREATE TRIGGER franqueados_changes_trigger AFTER INSERT OR DELETE OR UPDATE ON public.franqueados FOR EACH ROW EXECUTE FUNCTION notify_table_changes();                         +
 
 CREATE TRIGGER franqueados_normaliza_owner_type_ins BEFORE INSERT ON public.franqueados FOR EACH ROW EXECUTE FUNCTION trg_franqueados_normaliza_owner_type();                   +
 
 CREATE TRIGGER franqueados_normaliza_owner_type_upd BEFORE UPDATE OF owner_type ON public.franqueados FOR EACH ROW EXECUTE FUNCTION trg_franqueados_normaliza_owner_type();     +
 
 CREATE TRIGGER notify_franqueados_changes AFTER INSERT OR DELETE OR UPDATE ON public.franqueados FOR EACH ROW EXECUTE FUNCTION notify_table_changes();                          +
 
 CREATE TRIGGER on_franqueados_change AFTER INSERT OR UPDATE ON public.franqueados FOR EACH ROW EXECUTE FUNCTION notify_webhook();                                               +
 

