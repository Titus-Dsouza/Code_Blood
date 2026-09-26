"""DRF endpoints. Firebase Auth verifies identity; Firestore stores app data."""
import hashlib, hmac, os, re
from datetime import date, datetime, timezone
from uuid import uuid4

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError, NotFound
from services.firebase import firestore_client
from api.exceptions import Conflict, FirebaseUnavailable
from services.matching import evaluate, score_profile
from api.authentication import current_profile, require_role

JOB_TYPES = {"driver", "warehouse", "fleet", "vehicle", "cargo", "workforce", "labour", "labor"}
LOGISTICS_TERMS = {"logistics", "transportation", "transport", "supply chain", "warehouse", "fleet", "cargo", "cold chain", "route", "procurement", "wms", "delivery", "driver", "vehicle", "freight", "dispatch", "forklift", "labour", "labor", "workforce", "shipping", "port", "freight forwarding"}
COLLECTIONS = {"employees": ("employees", "employee_profiles"), "employers": ("employers", "employer_profiles"), "jobRequirements": ("jobRequirements", "requirements"), "hiringRequests": ("hiringRequests", "hiring_requests"), "learningResources": ("learningResources", "learning_resources")}

def db(): return firestore_client()
def now(): return datetime.now(timezone.utc).isoformat()
def norm(s): return re.sub(r"\s+", " ", str(s or "").strip().lower())
def data_of(s): return {"id": s.id, **(s.to_dict() or {})} if s.exists else None
def collection(name): return db().collection(name)
def get_doc(name, ident):
    names = COLLECTIONS.get(name, (name,))
    for col in names:
        row = data_of(collection(col).document(ident).get())
        if row is not None: return row
    return None
def all_docs(name, limit=500):
    names = COLLECTIONS.get(name, (name,))
    merged = {}
    for col in names:
        for s in collection(col).limit(limit).stream(): merged.setdefault(s.id, data_of(s))
    return list(merged.values())
def write_compat(name, ident, data, merge=False):
    names = COLLECTIONS.get(name, (name,))
    # New canonical names receive all writes; legacy data remains intact.
    collection(names[0]).document(ident).set(data, merge=merge)
def require_fields(payload, fields):
    for key, minimum, maximum in fields:
        value = payload.get(key)
        if not isinstance(value, str) or len(value.strip()) < minimum or len(value) > maximum:
            raise ValidationError({key: f"Enter between {minimum} and {maximum} characters."})
def listing(query, status=None):
    rows = all_docs(query, 1500)
    return [r for r in rows if status is None or r.get("status") == status]
def role_data(profile): return "employees" if profile.get("role") == "employee" else "employers"
def required(profile, role):
    if profile.get("role") != role: raise PermissionDenied(f"{role.title()} access required")
    return profile
def safe_user(profile): return {k:v for k,v in profile.items() if k not in {"aadhaar", "aadhaar_number", "aadhaar_hash", "gstin", "aadhaar_hmac_sha256"}}

@api_view(["GET"])
@permission_classes([AllowAny])
def health(request): return Response({"success": True, "message": "Logix Django backend is running", "storage": "Firebase Cloud Firestore"})
@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request): return Response({"success": True, "message": "Logix API", "docs": None})
@api_view(["GET"])
@permission_classes([AllowAny])
def firebase_health(request):
    next(db().collection("skills").limit(1).stream(), None)
    return Response({"success": True, "service": "Logix Django + Firebase Admin + Firestore"})

@api_view(["POST"])
def signup(request):
    p=request.data; require_fields(p, [("name",2,120),("email",3,254),("city",2,80)])
    if not request.user.get("phone_number"): raise ValidationError({"phone":"Firebase phone verification is required"})
    dob=p.get("date_of_birth")
    try: dob=date.fromisoformat(dob).isoformat()
    except (TypeError,ValueError): raise ValidationError({"date_of_birth":"Use YYYY-MM-DD."})
    aadhaar=str(p.get("aadhaar_number", ""))
    if not re.fullmatch(r"\d{12}", aadhaar): raise ValidationError({"aadhaar_number":"Aadhaar must contain exactly 12 digits."})
    gstin=str(p.get("gstin") or "").strip().upper()
    if gstin and not re.fullmatch(r"[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]",gstin): raise ValidationError({"gstin":"GSTIN format is invalid."})
    secret=os.getenv("AADHAAR_HASH_SECRET", "")
    if len(secret)<32: raise FirebaseUnavailable("Set a private AADHAAR_HASH_SECRET of at least 32 characters before signup.")
    uid=request.user["uid"]; store=db(); user_ref=store.collection("users").document(uid)
    if user_ref.get().exists: raise Conflict("Account already exists; sign in instead.")
    role="employer" if gstin else "employee"; stamp=now()
    profile={"uid":uid,"name":p["name"].strip(),"email":p["email"].strip().lower(),"phone":request.user["phone_number"],"date_of_birth":dob,"city":p["city"].strip(),"role":role,"created_at":stamp,"updated_at":stamp}
    identity={"aadhaar_hmac_sha256":hmac.new(secret.encode(),aadhaar.encode(),hashlib.sha256).hexdigest(),"aadhaar_status":"provided_not_officially_verified","gstin":gstin or None,"updated_at":stamp}
    role_name="employees" if role=="employee" else "employers"
    role_profile={"uid":uid,"name":profile["name"],"city":profile["city"],"updated_at":stamp}
    role_profile.update({"job_preference":"","skills":[],"experience":0} if role=="employee" else {"company_name":"","description":""})
    batch=store.batch(); batch.set(user_ref,profile); batch.set(store.collection("private_identity").document(uid),identity); batch.set(store.collection(role_name).document(uid),role_profile); batch.commit()
    return Response({"success":True,"profile":profile})

@api_view(["GET","PUT"])
def account_me(request):
    profile=current_profile(request)
    if request.method=="GET": return Response(safe_user(profile))
    p=request.data; data={k:p[k] for k in ("name","email","city") if k in p and p[k] is not None}
    if "name" in data: require_fields(data,[("name",2,120)])
    if "email" in data: require_fields(data,[("email",3,254)])
    if "city" in data: require_fields(data,[("city",2,80)])
    data["updated_at"]=now(); collection("users").document(profile["uid"]).update(data)
    subset={k:v for k,v in data.items() if k in ("name","city")}
    if subset: write_compat(role_data(profile),profile["uid"],subset,True)
    return Response(safe_user({**profile,**data}))

@api_view(["GET","POST","PUT"])
def employee_profile(request):
    profile=required(current_profile(request),"employee"); uid=profile["uid"]
    if request.method=="GET":
        result=get_doc("employees",uid)
        if not result or not result.get("job_preference"): raise NotFound("Employee profile not found")
        return Response(result)
    p=request.data; require_fields(p,[("name",2,120),("city",2,80),("job_preference",2,80)])
    if norm(p["job_preference"]) not in JOB_TYPES: raise ValidationError({"job_preference":"Choose a supported logistics work category."})
    category=norm(p["job_preference"])
    category_fields={"driver":("vehicle_type","license_type"),"fleet":("vehicle_type",),"vehicle":("vehicle_type",),"warehouse":("warehouse_type",),"cargo":("cargo_type",),"workforce":("work_type",),"labour":("work_type",),"labor":("work_type",)}
    missing=[field for field in category_fields.get(category,()) if not str(p.get(field) or "").strip()]
    if missing: raise ValidationError({field:"This field is required for the selected logistics category." for field in missing})
    skills=p.get("skills",[])
    if not isinstance(skills,list) or len(skills)>50 or not all(isinstance(v,str) for v in skills): raise ValidationError({"skills":"Provide up to 50 skill names."})
    try: experience=int(p.get("experience",0))
    except (TypeError,ValueError): raise ValidationError({"experience":"Enter years as a number."})
    if not 0<=experience<=60: raise ValidationError({"experience":"Experience must be between 0 and 60 years."})
    old=get_doc("employees",uid) or {}; stamp=now()
    result={k:p.get(k) for k in ("name","city","job_preference","skills","vehicle_type","license_type","warehouse_type","cargo_type","work_type","warehouse_experience","licence_type","vehicles_can_drive") if k in p}
    result.update({"uid":uid,"name":p["name"].strip(),"city":p["city"].strip(),"skills":skills,"experience":experience,"updated_at":stamp,"created_at":old.get("created_at",stamp)})
    write_compat("employees",uid,result,True); collection("users").document(uid).update({"name":result["name"],"city":result["city"],"updated_at":stamp})
    return Response(result)

@api_view(["GET","POST","PUT"])
def employer_profile(request):
    profile=required(current_profile(request),"employer"); uid=profile["uid"]
    if request.method=="GET":
        result=get_doc("employers",uid)
        if not result or not result.get("company_name"): raise NotFound("Employer profile not found")
        return Response(result)
    p=request.data; require_fields(p,[("company_name",2,150),("city",2,80)])
    old=get_doc("employers",uid) or {}; stamp=now()
    result={"uid":uid,"name":profile.get("name"),"company_name":p["company_name"].strip(),"city":p["city"].strip(),"description":str(p.get("description", ""))[:2000],"updated_at":stamp,"created_at":old.get("created_at",stamp)}
    write_compat("employers",uid,result,True); collection("users").document(uid).update({"city":result["city"],"updated_at":stamp})
    return Response(result)

def match_score(employee,job):
    return score_profile(employee,job)

def requirement_data(p):
    require_fields(p,[("title",2,150),("job_type",2,80),("city",2,80),("description",10,5000)])
    if norm(p["job_type"]) not in JOB_TYPES: raise ValidationError({"job_type":"Choose a supported logistics work category."})
    skills=p.get("required_skills",[])
    if not isinstance(skills,list) or len(skills)>50: raise ValidationError({"required_skills":"Provide up to 50 skill names."})
    category=norm(p["job_type"])
    category_fields={"driver":("vehicle_type","license_type"),"fleet":("vehicle_type",),"vehicle":("vehicle_type",),"warehouse":("warehouse_type",),"cargo":("cargo_type",),"workforce":("work_type",),"labour":("work_type",),"labor":("work_type",)}
    missing=[field for field in category_fields.get(category,()) if not str(p.get(field) or "").strip()]
    if missing: raise ValidationError({field:"This requirement is needed for the selected logistics category." for field in missing})
    try: exp=int(p.get("experience_required",0)); salary=p.get("salary")
    except (TypeError,ValueError): raise ValidationError("Experience and salary must be numbers.")
    return {k:p.get(k) for k in ("title","job_type","city","description","vehicle_type","warehouse_type","cargo_type","work_type","license_type","licence_type","vehicles_required","warehouse_requirement","cargo_requirement","workforce_requirement") if p.get(k) is not None} | {"required_skills":skills,"experience_required":max(0,min(60,exp)),"salary":salary}

@api_view(["GET"])
def jobs(request):
    profile=current_profile(request); rows=listing("jobs","active")
    city=request.query_params.get("city"); category=request.query_params.get("category")
    if city and city!="All": rows=[j for j in rows if j.get("city")==city]
    if category and category!="All": rows=[j for j in rows if norm(j.get("job_type"))==norm(category)]
    employee=get_doc("employees",profile["uid"]) if profile.get("role")=="employee" else {}
    for job in rows:
        emp=get_doc("employers",job.get("employer_id","")) or {}; score,gaps,label=match_score(employee or {},job)
        job.update({"company_name":emp.get("company_name","Logix employer"),"match":score,"match_score":score,"match_status":label,"skill_gaps":gaps})
    return Response(rows[:200])

@api_view(["GET","POST"])
def requirements(request):
    if request.method=="GET":
        profile=required(current_profile(request),"employer")
        return Response([r for r in all_docs("jobRequirements",500) if r.get("employer_id")==profile["uid"]])
    profile=required(current_profile(request),"employer"); fields=requirement_data(request.data); store=db(); rid=uuid4().hex; jid=uuid4().hex; stamp=now()
    req={**fields,"id":rid,"employer_id":profile["uid"],"status":"open","created_at":stamp}; job={**fields,"id":jid,"requirement_id":rid,"employer_id":profile["uid"],"status":"active","created_at":stamp}
    batch=store.batch(); batch.set(store.collection("jobRequirements").document(rid),req); batch.set(store.collection("requirements").document(rid),req); batch.set(store.collection("jobs").document(jid),job); batch.commit()
    return Response({"requirement":req,"job":job})

@api_view(["POST"])
def jobs_create(request):
    profile=required(current_profile(request),"employer"); fields=requirement_data(request.data); rid=request.data.get("requirement_id")
    if rid:
        req=get_doc("jobRequirements",rid)
        if not req or req.get("employer_id")!=profile["uid"]: raise NotFound("Requirement not found for this employer")
    jid=uuid4().hex; result={**fields,"id":jid,"requirement_id":rid,"employer_id":profile["uid"],"status":"active","created_at":now()}; collection("jobs").document(jid).set(result); return Response(result)

@api_view(["GET"])
def matches(request):
    profile=required(current_profile(request),"employer"); kind=request.query_params.get("job_type","")
    if len(kind)<2: raise ValidationError({"job_type":"This query parameter is required."})
    reqs=[r for r in all_docs("jobRequirements",500) if r.get("employer_id")==profile["uid"] and norm(r.get("job_type"))==norm(kind) and r.get("status")=="open"]
    employees=[e for e in all_docs("employees",500) if norm(e.get("job_preference"))==norm(kind)]
    candidates=[]
    for e in employees:
        relevant=[r for r in reqs if not r.get("city") or norm(e.get("city"))==norm(r["city"])]
        evaluations=[evaluate(e,r) for r in relevant]
        best=max(evaluations,key=lambda x:x["score"]) if evaluations else {"score":0,"status":"Skill Gap","gaps":["No open requirements for this category"]}
        e["match_score"]=best["score"]; e["match_status"]=best["status"]; e["skill_gaps"]=best["gaps"]
        candidates.append(e)
    candidates.sort(key=lambda e:e["match_score"],reverse=True)
    return Response({"count":len(candidates),"results":[{"id":e["uid"],"name":e.get("name"),"job_preference":e.get("job_preference"),"skills":e.get("skills",[]),"city":e.get("city"),"experience":e.get("experience",0),"match_score":e["match_score"],"match_status":e["match_status"],"skill_gaps":e["skill_gaps"]} for e in candidates]})

@api_view(["POST"])
def apply_job(request,job_id):
    profile=required(current_profile(request),"employee"); job=get_doc("jobs",job_id)
    if not job or job.get("status")!="active": raise NotFound("Active job not found")
    ref=collection("applications").document(f"{job_id}_{profile['uid']}")
    if ref.get().exists: raise Conflict("You have already applied for this job.")
    ref.set({"job_id":job_id,"employee_id":profile["uid"],"employer_id":job.get("employer_id"),"status":"Applied","created_at":now()}); return Response({"success":True,"status":"Applied"})

@api_view(["GET","POST"])
def employer_hiring_requests(request):
    profile=required(current_profile(request),"employer")
    if request.method=="POST":
        p=request.data; uid=str(p.get("employee_id", "")); kind=str(p.get("job_type", "")); employee=get_doc("employees",uid)
        if not employee: raise NotFound("Employee profile not found")
        if norm(employee.get("job_preference"))!=norm(kind): raise PermissionDenied("Employee does not match this logistics job category")
        rid=p.get("requirement_id")
        if rid:
            req=get_doc("jobRequirements",rid)
            if not req or req.get("employer_id")!=profile["uid"]: raise NotFound("Requirement not found for this employer")
        ident=uuid4().hex; row={"id":ident,"employer_id":profile["uid"],"employee_id":uid,"job_type":kind,"requirement_id":rid,"status":"PENDING","created_at":now()}
        write_compat("hiringRequests",ident,row); return Response(row,status=201)
    rows=[r for r in all_docs("hiringRequests",500) if r.get("employer_id")==profile["uid"]]
    for row in rows:
        e=get_doc("employees",row.get("employee_id")) or {}; row["employee_name"]=e.get("name","Logix employee"); row["city"]=e.get("city","")
    return Response(rows)

@api_view(["GET"])
def employee_hiring_requests(request):
    profile=required(current_profile(request),"employee"); rows=[r for r in all_docs("hiringRequests",500) if r.get("employee_id")==profile["uid"]]
    for row in rows:
        e=get_doc("employers",row.get("employer_id")) or {}; row["company_name"]=e.get("company_name","Logix employer")
    return Response(rows)

@api_view(["PATCH"])
def update_hiring_request(request,request_id):
    profile=required(current_profile(request),"employee"); ref=collection("hiringRequests").document(request_id); snap=ref.get()
    if not snap.exists:
        ref=collection("hiring_requests").document(request_id); snap=ref.get()
    row=data_of(snap)
    if not row or row.get("employee_id")!=profile["uid"]: raise NotFound("Hiring request not found")
    status=str(request.data.get("status","")).upper()
    if status not in {"ACCEPTED","REJECTED"}: raise ValidationError({"status":"Use ACCEPTED or REJECTED."})
    if str(row.get("status","")).upper()!="PENDING": raise Conflict("This hiring request has already been answered.")
    ref.update({"status":status,"updated_at":now()}); return Response({"success":True,"status":status})

@api_view(["PATCH"])
def cancel_hiring_request(request,request_id):
    profile=required(current_profile(request),"employer"); ref=collection("hiringRequests").document(request_id); snap=ref.get()
    if not snap.exists: ref=collection("hiring_requests").document(request_id); snap=ref.get()
    row=data_of(snap)
    if not row or row.get("employer_id")!=profile["uid"]: raise NotFound("Hiring request not found")
    if str(row.get("status","")).upper()!="PENDING": raise Conflict("Only pending requests can be cancelled.")
    ref.update({"status":"CANCELLED","updated_at":now()}); return Response({"success":True,"status":"CANCELLED"})

@api_view(["GET"])
def skills(request): return Response(all_docs("skills",500))

@api_view(["GET"])
def learning(request):
    rows=all_docs("learningResources",500); skill=norm(request.query_params.get("skill", ""))
    if skill: rows=[r for r in rows if skill in {norm(s) for s in r.get("skills",[])}]
    return Response(rows)

@api_view(["GET"])
def skill_gaps(request):
    profile=required(current_profile(request),"employee"); emp=get_doc("employees",profile["uid"]) or {}; have={norm(s) for s in emp.get("skills",[])}; gaps={}
    for req in all_docs("jobRequirements",800):
        if req.get("status")!="open" or (req.get("city") and norm(req["city"])!=norm(emp.get("city"))): continue
        for skill in req.get("required_skills",[]):
            if norm(skill) not in have: gaps[skill]=gaps.get(skill,0)+1
    labels=sorted(gaps,key=gaps.get,reverse=True)
    resources=all_docs("learningResources",500)
    recommendations=[r for r in resources if any(norm(s) in {norm(x) for x in r.get("skills",[])} for s in labels)]
    return Response({"gaps":labels,"count":len(labels),"learning_resources":recommendations})

@api_view(["GET"])
def employee_summary(request):
    profile=required(current_profile(request),"employee"); emp=get_doc("employees",profile["uid"]) or {}; active=listing("jobs","active"); eligible=[j for j in active if match_score(emp,j)[0]>=50]
    gaps=skill_gaps(request).data; reqs=[r for r in all_docs("jobRequirements",500) if r.get("status")=="open" and (not r.get("city") or r.get("city")==emp.get("city"))]
    wants={norm(s) for r in reqs for s in r.get("required_skills",[])}; have={norm(s) for s in emp.get("skills",[])}
    return Response({"jobs_available":len(eligible),"skill_readiness":round(len(wants&have)/len(wants)*100) if wants else 0,"skill_gaps":gaps["gaps"][:6],"profile_skills":emp.get("skills",[])})

@api_view(["GET"])
def employer_summary(request):
    profile=required(current_profile(request),"employer"); reqs=[r for r in all_docs("jobRequirements",500) if r.get("employer_id")==profile["uid"] and r.get("status")=="open"]
    emps=all_docs("employees",500); count=sum(1 for e in emps for r in reqs if norm(e.get("job_preference"))==norm(r.get("job_type")))
    gaps={s for r in reqs for s in r.get("required_skills",[])}
    return Response({"active_requirements":len(reqs),"fleet_requirements":sum(norm(r.get("job_type")) in {"fleet","vehicle"} for r in reqs),"skill_gaps":len(gaps),"candidate_matches":count,"requirements":reqs[:10]})

@api_view(["GET"])
def demand(request):
    current_profile(request); reqs=[r for r in all_docs("jobRequirements",1000) if r.get("status")=="open"]; skill_counts={}; cities={}
    for r in reqs:
        for s in r.get("required_skills",[]): skill_counts[s]=skill_counts.get(s,0)+1
        if r.get("city"): cities[r["city"]]=cities.get(r["city"],0)+1
    return Response({"requirements_count":len(reqs),"skills":sorted(skill_counts.items(),key=lambda x:x[1],reverse=True)[:12],"cities":sorted(cities.items(),key=lambda x:x[1],reverse=True)})

@api_view(["POST"])
def logisky(request):
    profile=current_profile(request); question=request.data.get("question")
    if not isinstance(question,str) or not question.strip() or len(question)>1000: raise ValidationError({"question":"Enter a question of up to 1000 characters."})
    text=norm(question)
    if not any(term in text for term in LOGISTICS_TERMS): return Response({"answer":"Invalid Questions"})
    if "wms" in text: answer="WMS (Warehouse Management System) supports warehouse inventory, storage, picking and dispatch operations."
    elif any(t in text for t in ("driver","vehicle","fleet","route")): answer="Driver and fleet roles rely on safe vehicle operation, route planning, dispatch communication and maintenance awareness."
    elif any(t in text for t in ("skill gap","skill","course","learning")): answer="Explore the Learning section for logistics courses related to current workforce skills and employer requirements."
    else: answer="Logistics operations connect transportation, fleet, warehousing, cargo handling and workforce planning. Tell me which area you want to explore."
    return Response({"answer":answer})

@api_view(["GET"])
def news(request):
    current_profile(request)
    return Response(all_docs("news",100) if os.getenv("LOGISTICS_NEWS_FEED_CONFIGURED", "false").lower()=="true" else [])
