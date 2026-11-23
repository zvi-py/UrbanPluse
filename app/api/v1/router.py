from fastapi import APIRouter
from app.api.v1.students import router as students_router
from app.api.v1.communities import router as communities_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.opportunities import router as opportunities_router

api_router = APIRouter()

# Register feature sub-routers
api_router.include_router(students_router, prefix="/students", tags=["Students"])
api_router.include_router(communities_router, prefix="/communities", tags=["Communities & Study Groups"])
api_router.include_router(recommendations_router, prefix="/recommendations", tags=["Recommendations Engine"])
api_router.include_router(opportunities_router, prefix="/opportunities", tags=["Workshops & Opportunities"])


@api_router.get("/status", tags=["System"])
def get_api_status():
    """
    Returns the operational status of API v1.
    """
    return {
        "status": "healthy",
        "api_version": "v1",
        "message": "UrbanPulse Student Community Agent API v1 is active."
    }
