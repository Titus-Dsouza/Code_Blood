"""DRF flow tests with a Firestore-compatible test double (no live credentials)."""
from copy import deepcopy
import pytest
from rest_framework.test import APIClient
from firebase_admin import auth

class Snapshot:
    def __init__(self, ident, data): self.id,self.data,self.exists=ident,deepcopy(data),data is not None
    def to_dict(self): return deepcopy(self.data)

class Document:
    def __init__(self,store,col,ident): self.store,self.col,self.id=store,col,ident
    def get(self): return Snapshot(self.id,self.store.get(self.col,{}).get(self.id))
    def set(self,data,merge=False):
        bucket=self.store.setdefault(self.col,{})
        bucket[self.id]={**bucket.get(self.id,{}),**deepcopy(data)} if merge else deepcopy(data)
    def update(self,data):
        if self.id not in self.store.get(self.col,{}): raise KeyError(self.id)
        self.store[self.col][self.id].update(deepcopy(data))

class Query:
    def __init__(self,store,col,filters=(),maximum=None): self.store,self.col,self.filters,self.maximum=store,col,filters,maximum
    def document(self,ident): return Document(self.store,self.col,ident)
    def where(self,key,op,value): return Query(self.store,self.col,(*self.filters,(key,value)),self.maximum)
    def limit(self,count): return Query(self.store,self.col,self.filters,count)
    def stream(self):
        vals=[(k,v) for k,v in self.store.get(self.col,{}).items() if all(v.get(key)==value for key,value in self.filters)]
        return iter([Snapshot(k,v) for k,v in vals[:self.maximum]])

class Batch:
    def __init__(self): self.ops=[]
    def set(self,doc,data): self.ops.append((doc,data))
    def commit(self):
        for doc,data in self.ops: doc.set(data)

class Firestore:
    def __init__(self): self.store={}
    def collection(self,col): return Query(self.store,col)
    def batch(self): return Batch()

@pytest.fixture
def client(monkeypatch, settings):
    db=Firestore(); tokens={"employee-token":{"uid":"employee-1","phone_number":"+919876543210"},"employer-token":{"uid":"employer-1","phone_number":"+919999999999"}}
    monkeypatch.setattr(auth,"verify_id_token",lambda token,**kwargs:tokens[token])
    monkeypatch.setattr("services.firebase.firebase_app",lambda:object())
    monkeypatch.setattr("api.authentication.firestore_client",lambda:db)
    monkeypatch.setattr("api.views.firestore_client",lambda:db)
    monkeypatch.setenv("AADHAAR_HASH_SECRET","test-only-secret-with-at-least-32-characters")
    api=APIClient()
    return api,db

def headers(api,role): api.credentials(HTTP_AUTHORIZATION=f"Bearer {role}-token")
def signup(api,role,gstin=None):
    return api.post("/api/v1/account/signup",{"name":"Asha Logistics","email":"asha@example.com","date_of_birth":"1994-03-15","city":"Pune","aadhaar_number":"123456789012","gstin":gstin},format="json")

def test_verified_signup_profile_requirements_matching_and_hiring(client):
    api,db=client; headers(api,"employee"); response=signup(api,"employee")
    assert response.status_code==200 and response.data["profile"]["role"]=="employee"
    assert "aadhaar_number" not in response.data["profile"] and "123456789012" not in repr(db.store)
    api.post("/api/v1/employee/profile",{"name":"Asha Worker","city":"Pune","job_preference":"driver","skills":["WMS","Driving"],"experience":3,"vehicle_type":"Truck","license_type":"HMV"},format="json")
    headers(api,"employer"); response=signup(api,"employer","27ABCDE1234F1Z5")
    assert response.status_code==200 and response.data["profile"]["role"]=="employer"
    api.post("/api/v1/employer/profile",{"company_name":"Pune Freight Co","city":"Pune","description":"Freight services"},format="json")
    req=api.post("/api/v1/employer/requirements",{"title":"Logistics Driver","job_type":"driver","city":"Pune","description":"Drive freight safely between regional warehouses.","required_skills":["WMS","Driving"],"experience_required":2,"vehicle_type":"Truck","license_type":"HMV"},format="json")
    assert req.status_code==200 and "jobRequirements" in db.store and len(db.store["jobs"])==1
    match=api.get("/api/v1/employer/matches?job_type=driver")
    assert match.status_code==200 and match.data["results"][0]["id"]=="employee-1" and match.data["results"][0]["match_status"]=="Match"
    headers(api,"employee"); jobs=api.get("/api/v1/jobs"); assert jobs.status_code==200 and jobs.data[0]["match_status"]=="Match"
    hiring_api=api; headers(hiring_api,"employer")
    hiring=hiring_api.post("/api/v1/employer/hiring-requests",{"employee_id":"employee-1","job_type":"driver"},format="json")
    assert hiring.status_code==201 and hiring.data["status"]=="PENDING"
    headers(api,"employee"); requests=api.get("/api/v1/employee/hiring-requests"); assert requests.status_code==200
    accepted=api.patch(f"/api/v1/employee/hiring-requests/{hiring.data['id']}",{"status":"ACCEPTED"},format="json")
    assert accepted.status_code==200 and accepted.data["status"]=="ACCEPTED"
    headers(api,"employer")
    api.post("/api/v1/employer/requirements",{"title":"Warehouse associate","job_type":"warehouse","city":"Pune","description":"Handle inbound goods and inventory in our warehouse.","required_skills":["Inventory Control"],"warehouse_type":"Fulfillment"},format="json")
    db.collection("learningResources").document("inventory-course").set({"title":"Inventory course","skills":["Inventory Control"],"url":"https://example.invalid/course"})
    pending=api.post("/api/v1/employer/hiring-requests",{"employee_id":"employee-1","job_type":"driver"},format="json")
    cancelled=api.patch(f"/api/v1/employer/hiring-requests/{pending.data['id']}",{"status":"CANCELLED"},format="json")
    assert cancelled.status_code==200 and cancelled.data["status"]=="CANCELLED"
    headers(api,"employee")
    gap=api.get("/api/v1/employee/skill-gaps")
    assert gap.status_code==200 and gap.data["gaps"]==["Inventory Control"] and gap.data["learning_resources"][0]["id"]=="inventory-course"
    assert api.post("/api/v1/logisky",{"question":"Who won a cricket match?"},format="json").data=={"answer":"Invalid Questions"}

def test_role_cannot_be_selected_or_changed_by_client(client):
    api,_=client; headers(api,"employee"); signup(api,"employee")
    result=api.post("/api/v1/employer/requirements",{"title":"Warehouse Staff","job_type":"warehouse","city":"Pune","description":"Need trained staff for warehouse operations.","role":"employer"},format="json")
    assert result.status_code==403
    duplicate=signup(api,"employee","27ABCDE1234F1Z5")
    assert duplicate.status_code==409 and api.get("/api/v1/account/me").data["role"]=="employee"

def test_authentication_and_old_sql_routes_are_not_available(client):
    api,_=client; api.credentials()
    health=api.get("/health",HTTP_ORIGIN="http://127.0.0.1:5500")
    assert health.status_code==200 and health["Access-Control-Allow-Origin"]=="http://127.0.0.1:5500"
    assert api.get("/api/v1/jobs").status_code in (401,403)
    assert api.get("/api/employees").status_code==404
