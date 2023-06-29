import os 

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from .config.environment.Settings import get_general_settings

#import routers 
from .datasets import datasets
from .system.instruments import instruments
from .users import users
from .auth import auth
from .frontend import frontend
from .infrastructure import infrastructure
from .database.neo4DB import DB

from .helper.User import UserManagement


print(UserManagement(auth="aodad"))
print(UserManagement(auth="aasdad").DB.ad)
general_settings = get_general_settings()


app = FastAPI(
            title=general_settings.app_name,
            description=general_settings.description,
            version=general_settings.version,
            contact={
                    "name": general_settings.contact_full_name,
                    "url": general_settings.project_website_url,
                    "email": general_settings.contact_email
                },
            license_info={
                    "name": general_settings.licence_name,
                    "url": general_settings.licence_url,
                },
            redoc_url = "/api/docs"
            )


origins = [
    "http://localhost:5000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    frontend.router,
    prefix="/api/v1/frontend",
    tags = ["Input Fields"]
)

app.include_router(
    users.router,
    prefix="/api/v1/users",
    tags = ["Users","Authorisation"]
)

app.include_router(
    datasets.router,
    prefix = "/api/v1/datasets",
    tags = ["Datasets"]
)

app.include_router(
    instruments.router,
    prefix = "/api/v1/instruments",
    tags = ["Instruments"]
)

app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags = ["Authorisation"]
)

app.include_router(
    auth.router,
    prefix='/auth',
    tags=['Authorisation']
)

app.include_router(
    infrastructure.router,
    prefix = "/api/v1/affiliations",
    tags = ["Infrastructure"]
)


templates = Jinja2Templates(directory=f"{os.path.dirname(__file__)}/../build/")



@app.get("/", include_in_schema=False)
def frontend(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

app.mount("/static", StaticFiles(directory=f"{os.path.dirname(__file__)}/../build/static/", html=True), name="frontend")
