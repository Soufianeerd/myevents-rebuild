-- Operator back-office: append-only processing stages for print requests and
-- a read-only cross-tenant overview. Both functions are gated by the hashed
-- 'operator' service secret, held server-side only (never by the browser).
CREATE TABLE myevents.material_request_stages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 request_id uuid NOT NULL REFERENCES myevents.material_requests(id),
 tenant_id uuid NOT NULL,
 stage text NOT NULL CHECK(stage IN ('quote_sent','accepted','in_production','shipped','declined')),
 note text NOT NULL DEFAULT '' CHECK(length(note)<=1000),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX material_request_stages_request ON myevents.material_request_stages(request_id,created_at DESC);
ALTER TABLE myevents.material_request_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY request_stage_read ON myevents.material_request_stages FOR SELECT TO myevents_app USING(tenant_id=myevents.current_tenant());
GRANT SELECT ON myevents.material_request_stages TO myevents_app;

CREATE FUNCTION myevents.operator_authorized(p_secret text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT p_secret IS NOT NULL AND length(p_secret)>=32 AND EXISTS(SELECT FROM myevents.service_secrets WHERE name='operator' AND hash=encode(sha256(convert_to(p_secret,'UTF8')),'hex'))
$$;
REVOKE ALL ON FUNCTION myevents.operator_authorized(text) FROM PUBLIC;

CREATE FUNCTION myevents.operator_overview(p_secret text) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT myevents.operator_authorized(p_secret) THEN RAISE EXCEPTION 'Access denied'; END IF;
 RETURN jsonb_build_object(
  'totals', jsonb_build_object(
   'accounts', (SELECT count(*) FROM myevents.profiles),
   'events', (SELECT count(*) FROM myevents.events WHERE deleted_at IS NULL),
   'paidOrders', (SELECT count(*) FROM myevents.orders WHERE status='paid'),
   'revenueCents', (SELECT coalesce(sum((offer->>'amount')::integer),0) FROM myevents.orders WHERE status='paid')
  ),
  'orders', coalesce((SELECT jsonb_agg(o ORDER BY o->>'createdAt' DESC) FROM (
   SELECT jsonb_build_object('id',r.id,'eventId',r.event_id,'eventName',e.name,'offerName',r.offer->>'name','amount',(r.offer->>'amount')::integer,'status',r.status,'createdAt',r.created_at,'paidAt',r.paid_at) o
   FROM myevents.orders r JOIN myevents.events e ON e.id=r.event_id ORDER BY r.created_at DESC LIMIT 200) x),'[]'::jsonb),
  'requests', coalesce((SELECT jsonb_agg(q ORDER BY q->>'createdAt' DESC) FROM (
   SELECT jsonb_build_object('id',m.id,'eventId',m.event_id,'eventName',e.name,'material',m.payload->>'material','finish',m.payload->>'finish','quantity',(m.payload->>'quantity')::integer,'notes',m.payload->>'notes','createdAt',m.created_at,
    'stage',coalesce((SELECT s.stage FROM myevents.material_request_stages s WHERE s.request_id=m.id ORDER BY s.created_at DESC LIMIT 1),'requested'),
    'stageNote',coalesce((SELECT s.note FROM myevents.material_request_stages s WHERE s.request_id=m.id ORDER BY s.created_at DESC LIMIT 1),'')) q
   FROM myevents.material_requests m JOIN myevents.events e ON e.id=m.event_id ORDER BY m.created_at DESC LIMIT 200) y),'[]'::jsonb)
 );
END $$;

CREATE FUNCTION myevents.operator_set_request_stage(p_secret text,p_request uuid,p_stage text,p_note text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_tenant uuid;
BEGIN
 IF NOT myevents.operator_authorized(p_secret) THEN RAISE EXCEPTION 'Access denied'; END IF;
 SELECT tenant_id INTO v_tenant FROM myevents.material_requests WHERE id=p_request;
 IF v_tenant IS NULL THEN RAISE EXCEPTION 'Unknown request'; END IF;
 INSERT INTO myevents.material_request_stages(request_id,tenant_id,stage,note) VALUES(p_request,v_tenant,p_stage,coalesce(p_note,''));
END $$;

REVOKE ALL ON FUNCTION myevents.operator_overview(text),myevents.operator_set_request_stage(text,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION myevents.operator_overview(text),myevents.operator_set_request_stage(text,uuid,text,text) TO myevents_app;
INSERT INTO myevents.migrations(version) VALUES('0017_operator');
