from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from utils.database import db
from utils.models import (Booking, Branch, GroupClass, Service, TimeSlot,
                          Trainer)

SessionDep = Annotated[Session, Depends(db.get_session)]
router = APIRouter()


@router.get("/api/services")
async def return_services_endpoint(session: SessionDep):
    services = session.exec(select(Service)).all()
    return services


@router.get("/api/trainers")
async def return_trainers_endpoint(
    session: SessionDep,
    group_class_id: int = None,
    service_id: int = Query(None, alias="serviceId"),
):
    today = datetime.now().date()
    query = (
        select(Trainer)
        .join(Trainer.time_slots)
        .where(
            (TimeSlot.service_id == service_id if service_id else True),
            (TimeSlot.group_class_id == group_class_id if group_class_id else True),
            TimeSlot.dates >= today,
            TimeSlot.available == True,
        )
        .distinct()
    )
    trainers = session.exec(query).all()
    return trainers


@router.get("/api/timeslots")
async def return_timeslots_endpoint(
    session: SessionDep,
    service_id: int,
    trainer_id: int = Query(..., alias="trainerId"),
    date: str = Query(..., format="date"),
):
    timeslots = session.exec(
        select(TimeSlot).where(
            TimeSlot.trainer_id == trainer_id,
            TimeSlot.dates == date,
            TimeSlot.service_id == service_id,
            TimeSlot.available == True,
        )
    ).all()
    return timeslots


@router.post("/api/bookings")
async def post_booking_data_endpoint(session: SessionDep, booking_data: dict):
    if "serviceId" in booking_data:
        timeslot = session.exec(
            select(TimeSlot).where(
                TimeSlot.id == booking_data["timeSlotId"],
                TimeSlot.dates == booking_data["date"],
                TimeSlot.service_id == booking_data["serviceId"],
                TimeSlot.available == True,
            )
        ).first()

        if not timeslot:
            raise HTTPException(status_code=400, detail="Выбранное время уже занято")

        timeslot.available = False

        new_booking = Booking(
            service_id=booking_data["serviceId"],
            trainer_id=booking_data["trainerId"],
            dates=booking_data["date"],
            timeslot_id=booking_data["timeSlotId"],
        )

    else:
        timeslot = session.exec(
            select(TimeSlot).where(
                TimeSlot.id == booking_data["timeSlotId"],
            )
        ).first()

        if not timeslot:
            raise HTTPException(status_code=400, detail="Выбранное время уже занято")

        timeslot.available_spots -= 1
        if timeslot.available_spots == 0:
            timeslot.available = False

        new_booking = Booking(
            class_id=booking_data["classId"],
            dates=booking_data["date"],
            timeslot_id=booking_data["timeSlotId"],
            user_name=booking_data["name"],
            user_phone=booking_data["phone"],
            user_email=booking_data["email"],
        )

    session.add(new_booking)
    session.commit()

    return {"message": "Бронирование успешно создано", "booking_id": new_booking.id}


@router.get("/api/branch-info")
async def get_about_info(session: SessionDep):
    branch = session.exec(select(Branch)).all()
    return branch


@router.get("/api/booking-details")
async def get_success_data(session: SessionDep):
    query = (
        select(
            Booking.id,
            Booking.dates,
            TimeSlot.times.label("timeslot"),
            Trainer.name.label("trainer_name"),
            Service.name.label("service_name"),
        )
        .join(TimeSlot, Booking.timeslot_id == TimeSlot.id)
        .join(Trainer, Booking.trainer_id == Trainer.id)
        .join(Service, Booking.service_id == Service.id)
        .order_by(Booking.created_at.desc())
        .limit(1)
    )
    result = session.exec(query).first()

    if result:
        return {
            "serviceName": result.service_name,
            "trainerName": result.trainer_name,
            "date": result.dates,
            "time": result.timeslot,
        }
    return {"error": "No booking found"}


@router.get("/api/group-classes")
async def get_group_classes_endpoint(
    session: SessionDep, date: str = Query(..., format="formattedDate")
):
    query = (
        select(GroupClass, Trainer, TimeSlot)
        .join(TimeSlot, TimeSlot.group_class_id == GroupClass.id)
        .join(Trainer, Trainer.id == TimeSlot.trainer_id)
        .where(
            TimeSlot.dates == date,
            TimeSlot.available == True,
            TimeSlot.available_spots > 0,
        )
        .order_by(TimeSlot.dates, TimeSlot.times)
    )

    result = session.exec(query).all()

    response = []
    for group_class, trainer, time_slot in result:
        response.append(
            {
                "GroupClass": {
                    "id": group_class.id,
                    "name": group_class.name,
                    "duration": group_class.duration,
                    "description": group_class.description,
                    "price": group_class.price,
                },
                "Trainer": {
                    "id": trainer.id,
                    "name": trainer.name,
                    "description": trainer.description,
                    "photo": trainer.photo,
                },
                "TimeSlot": {
                    "id": time_slot.id,
                    "trainer_id": time_slot.trainer_id,
                    "date": time_slot.dates,
                    "times": time_slot.times,
                    "available": time_slot.available,
                    "available_spots": time_slot.available_spots,
                    "created_at": time_slot.created_at,
                },
            }
        )

    return response
