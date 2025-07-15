from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from fastapi import Cookie
from fastapi.responses import RedirectResponse
from datetime import datetime
import os
import json
import uuid

app = FastAPI()

# Mount static folder
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up template folder
templates = Jinja2Templates(directory="templates")

# JSON file to store notices
DATA_FILE = "data.json"

# Ensure data file exists
def load_data():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump({"announcements": [], "events": [], "market": []}, f, indent=4)
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

# Models
class Notice(BaseModel):
    category: str
    text: str

class UpdateNotice(BaseModel):
    text: str

# Routes

@app.get("/", response_class=RedirectResponse)
async def root_redirect():
    return RedirectResponse(url="/user")

@app.get("/user", response_class=HTMLResponse)
async def user_page(request: Request):
    return templates.TemplateResponse("user.html", {"request": request})

@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request, admin_auth: str = Cookie(default=None)):
    if admin_auth != "1":
        return RedirectResponse(url="/user")
    return templates.TemplateResponse("admin.html", {"request": request})

@app.get("/get_notices")
async def get_notices():
    data = load_data()
    return JSONResponse(content=data)

@app.post("/post_notice")
async def post_notice(notice: Notice):
    data = load_data()
    if notice.category not in data:
        raise HTTPException(status_code=400, detail="Invalid category")
    new_notice = {
        "id": str(uuid.uuid4()),
        "text": notice.text,
        "timestamp": datetime.now().isoformat()
    }
    data[notice.category].append(new_notice)
    save_data(data)
    return JSONResponse(content={"status": "success", "id": new_notice["id"]})

@app.delete("/delete_notice/{category}/{notice_id}")
async def delete_notice(category: str, notice_id: str):
    data = load_data()
    if category not in data:
        raise HTTPException(status_code=400, detail="Invalid category")
    data[category] = [n for n in data[category] if n.get("id") != notice_id]
    save_data(data)
    return {"status": "deleted"}

@app.put("/edit_notice/{category}/{notice_id}")
async def edit_notice(category: str, notice_id: str, updated: UpdateNotice):
    data = load_data()
    if category not in data:
        raise HTTPException(status_code=400, detail="Invalid category")
    found = False
    for notice in data[category]:
        if notice["id"] == notice_id:
            notice["text"] = updated.text
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Notice not found")
    save_data(data)
    return {"status": "updated"}
