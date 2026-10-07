const kinds=new Set(['context','access','binding','health','change','restore','recovery']);
const mutations=new Set(['access','binding','change','restore']);
export function assessContribution(record) {
 const r=record??{};const reasons=[];
 if(!kinds.has(r.kind)) reasons.push('UNSUPPORTED_CONTRIBUTION');
 for(const key of ['organization','environment','resource','actor','owner','purpose','correlation']) if(typeof r[key]!=='string'||!r[key].trim()) reasons.push('MISSING_'+key.toUpperCase());
 if(!Array.isArray(r.evidence)||!r.evidence.length||r.evidence.some(x=>typeof x!=='string'||!x.trim())) reasons.push('SOURCED_EVIDENCE_REQUIRED');
 if(r.secret_value!==undefined) reasons.push('SECRET_VALUES_FORBIDDEN');
 if(r.external_contact===true) reasons.push('CUSTOMER_SERVICE_REQUIRED');
 if(r.financial_effect===true||r.business_acceptance===true) reasons.push('COMPETENT_OWNER_REQUIRED');
 if(r.actor_authenticated!==true||r.actor_authorized!==true) reasons.push('AUTHORIZED_ACTOR_REQUIRED');
 if(r.source_current!==true||typeof r.source_version!=='string'||!r.source_version.trim()) reasons.push('CURRENT_SOURCE_REQUIRED');
 if(r.provider_qualified!==true) reasons.push('UNQUALIFIED_PROVIDER');
 if(mutations.has(r.kind)) {
  const a=r.authority;
  if(!a||a.accepted!==true||a.valid!==true||a.organization!==r.organization||a.environment!==r.environment||a.resource!==r.resource||a.actor!==r.actor||a.operation!==r.kind||a.purpose!==r.purpose||typeof a.evidence!=='string'||!a.evidence.trim()) reasons.push('EXACT_AUTHORITY_REQUIRED');
 }
 if(['change','restore'].includes(r.kind)&&(!r.candidate||!r.destination||r.preflight_pass!==true||r.recovery_usable!==true)) reasons.push('CONTROLLED_CHANGE_REQUIRED');
 if(r.effect_outcome!==undefined&&!['UNKNOWN','CONFIRMED_SUCCESS','CONFIRMED_FAILURE','NOT_ATTEMPTED'].includes(r.effect_outcome)) reasons.push('INVALID_EFFECT_OUTCOME');
 if(['change','restore'].includes(r.kind)&&(r.destination!==r.resource||r.authority?.destination!==r.destination||r.authority?.candidate!==r.candidate)) reasons.push('EXACT_CHANGE_AUTHORITY_REQUIRED');
 if(r.effect_outcome==='UNKNOWN') reasons.push('RECONCILE_BEFORE_RETRY');
 if(r.kind==='restore'&&(r.current_permissions_verified!==true||r.external_effects_preserved!==true||r.revoked_permissions_restored!==false||r.pending_work_reconciled!==true)) reasons.push('RESTORE_INTEGRITY_REQUIRED');
 return {result:reasons.length?'BLOCKED':'ELIGIBLE',observation:r.kind==='health'?(r.fresh===true&&['HEALTHY','DEGRADED','FAILED'].includes(r.observed_state)?r.observed_state:'UNKNOWN'):null,reasons};
}
