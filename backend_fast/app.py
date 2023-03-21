import os 

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .config.environment.Settings import get_general_settings

#import routers 
from .datasets import datasets
from .system.instruments import instruments
from .users import users
from .auth import auth
from .frontend import frontend
from .database.neo4DB import DB
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

app.include_router(
    frontend.router,
    prefix="/api/v1/frontend",
    tags = ["Frontend"]
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

templates = Jinja2Templates(directory=f"{os.path.dirname(__file__)}/../build/")



@app.get("/", include_in_schema=False)
def frontend(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

app.mount("/static", StaticFiles(directory=f"{os.path.dirname(__file__)}/../build/static/", html=True), name="frontend")
