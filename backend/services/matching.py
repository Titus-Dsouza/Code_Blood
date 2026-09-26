"""Explainable rule based logistics matching; future ranking strategies can replace this."""
def normalize(value):
    return " ".join(str(value or "").strip().lower().split())

def evaluate(employee, requirement):
    gaps=[]
    present={normalize(item) for item in employee.get("skills", [])}
    for skill in requirement.get("required_skills", []):
        if normalize(skill) not in present: gaps.append(skill)
    fields=(
        ("vehicle_type", "vehicle requirement"),
        ("license_type", "licence requirement"),
        ("warehouse_type", "warehouse experience"),
        ("cargo_type", "cargo experience"),
        ("work_type", "work experience"),
    )
    for field,label in fields:
        wanted=normalize(requirement.get(field)); have=normalize(employee.get(field) or employee.get("licence_type" if field=="license_type" else field))
        if wanted and wanted not in have: gaps.append(label + ": " + str(requirement[field]))
    if int(employee.get("experience",0)) < int(requirement.get("experience_required",0)):
        gaps.append(f"{requirement['experience_required']} years of experience")
    score,_missing,label=score_profile(employee,requirement)
    if label != "Match" and not gaps: gaps.append("Location or category alignment")
    return {"score":score,"status":label,"gaps":gaps}

def score_profile(employee, requirement):
    have={normalize(s) for s in employee.get("skills", [])}; wanted={normalize(s) for s in requirement.get("required_skills", [])}
    skills=len(have & wanted)/max(1,len(wanted)); category=normalize(employee.get("job_preference"))==normalize(requirement.get("job_type"))
    city=normalize(employee.get("city"))==normalize(requirement.get("city")); experience=int(employee.get("experience",0))>=int(requirement.get("experience_required",0))
    domain_fields=("vehicle_type","license_type","warehouse_type","cargo_type","work_type")
    specified=[field for field in domain_fields if requirement.get(field)]
    domain=(sum(normalize(requirement[field]) in normalize(employee.get(field) or (employee.get("licence_type") if field=="license_type" else "")) for field in specified)/len(specified)) if specified else 1.0
    score=round((skills*.5+category*.15+city*.1+experience*.1+domain*.15)*100)
    missing=sorted(wanted-have); status="Match" if score>=80 and not missing and experience and domain==1 else "Partial Match" if score>=50 else "Skill Gap"
    return score,missing,status
