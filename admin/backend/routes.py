from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from utils.database import db
from utils.models import GroupClass, Service, TimeSlot, Trainer

SessionDep = Annotated[Session, Depends(db.get_session)]
router = APIRouter()


class TimeSlotRequest(BaseModel):
    trainer_name: str
    service_name: str | None = None
    group_name: str | None = None
    date: str
    time: str
    status: bool
    available_spots: int


@router.get("/api/admin/trainers")
async def get_trainers_endpoint(session: SessionDep):
    return session.exec(select(Trainer)).all()


@router.get("/api/admin/trainer/{trainer_id}")
async def get_trainer_endpoint(
    trainer_id: int, session: Session = Depends(db.get_session)
):
    trainer = session.get(Trainer, trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Тренер не найден")
    return trainer


@router.post("/api/admin/trainer/add")
async def add_trainer_endpoint(session: SessionDep, trainer: Trainer):
    try:
        if not trainer.name or not trainer.specialization:
            raise HTTPException(
                status_code=400, detail="Имя и Специализация обязательны"
            )
        existing_trainer = session.exec(
            select(Trainer).where(
                Trainer.name == trainer.name,
                Trainer.specialization == trainer.specialization,
            )
        ).first()
        if existing_trainer:
            raise HTTPException(
                status_code=400, detail="Тренер уже существует"
            )
        session.add(trainer)
        session.commit()
        session.refresh(trainer)
        return {"trainer_id": trainer.id}
    except Exception as e:
        session.rollback()
        raise e


@router.delete("/api/admin/trainer/delete/{trainer_id}")
async def delete_trainer_endpoint(session: SessionDep, trainer_id: int):
    try:
        trainer = session.get(Trainer, trainer_id)
        if not trainer:
            raise HTTPException(status_code=404, detail="Тренер не найден")
        session.delete(trainer)
        session.commit()
    except Exception as e:
        session.rollback()
        raise e


@router.put("/api/admin/trainer/edit/{trainer_id}")
async def edit_trainer_endpoint(
    session: SessionDep, trainer_id: int, trainer_data: Trainer
):
    try:
        trainer = session.get(Trainer, trainer_id)
        if not trainer:
            raise HTTPException(status_code=404, detail="Тренер не найден")

        trainer.name = trainer_data.name
        trainer.description = trainer_data.description
        trainer.specialization = trainer_data.specialization
        trainer.photo = trainer_data.photo
        session.commit()
    except Exception as e:
        session.rollback()
        raise e


@router.get("/api/admin/services")
async def return_services_endpoint(session: SessionDep):
    services = session.exec(select(Service)).all()
    return services


@router.get("/api/admin/service/{service_id}")
async def get_service_endpoint(
    service_id: int, session: Session = Depends(db.get_session)
):
    service = session.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Сервис не найден")
    return service


@router.post("/api/admin/service/add")
async def add_service_endpoint(session: SessionDep, service: Service):
    try:
        if not service.name or not service.type:
            raise HTTPException(
                status_code=400, detail="Название и тип обязательны"
            )
        existing_service = session.exec(
            select(Service).where(
                Service.name == service.name, Service.type == service.type
            )
        ).first()
        if existing_service:
            raise HTTPException(
                status_code=400, detail="Сервис уже существует"
            )
        session.add(service)
        session.commit()
        session.refresh(service)
        return {"service_id": service.id}
    except Exception as e:
        session.rollback()
        raise e


@router.delete("/api/admin/service/delete/{service_id}")
async def delete_service_endpoint(session: SessionDep, service_id: int):
    try:
        service = session.get(Service, service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Сервис не найден")
        session.delete(service)
        session.commit()
    except Exception as e:
        session.rollback()
        raise e


@router.put("/api/admin/service/edit/{service_id}")
async def edit_service_endpoint(
    session: SessionDep, service_id: int, service_data: Service
):
    try:
        service = session.get(Service, service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Сервис не найден")

        service.name = service_data.name
        service.duration = service_data.duration
        service.description = service_data.description
        service.price = service_data.price
        service.photo = service_data.photo
        service.type = service_data.type
        session.commit()
    except Exception as e:
        session.rollback()
        raise e


@router.get("/api/admin/groups")
async def return_groups_endpoint(session: SessionDep):
    groups = session.exec(select(GroupClass)).all()
    return groups


@router.get("/api/admin/group/{group_id}")
async def get_group_endpoint(
    group_id: int, session: Session = Depends(db.get_session)
):
    group = session.get(GroupClass, group_id)
    if not group:
        raise HTTPException(
            status_code=404, detail="Групповое занятие не найдено"
        )
    return group


@router.post("/api/admin/group/add")
async def add_group_endpoint(session: SessionDep, group: GroupClass):
    try:
        if not group.name:
            raise HTTPException(
                status_code=400, detail="Название является обязательным"
            )
        existing_group = session.exec(
            select(GroupClass).where(GroupClass.name == group.name)
        ).first()
        if existing_group:
            raise HTTPException(
                status_code=400, detail="Групповое занятие уже существует"
            )
        session.add(group)
        session.commit()
        session.refresh(group)
        return {"group_id": group.id}
    except Exception as e:
        session.rollback()
        raise e


@router.delete("/api/admin/group/delete/{group_id}")
async def delete_group_endpoint(session: SessionDep, group_id: int):
    try:
        group = session.get(GroupClass, group_id)
        if not group:
            raise HTTPException(
                status_code=404, detail="Групповое занятие не найдено"
            )
        session.delete(group)
        session.commit()
    except Exception as e:
        session.rollback()
        raise e


@router.put("/api/admin/group/edit/{group_id}")
async def edit_group_endpoint(
    session: SessionDep, group_id: int, group_data: GroupClass
):
    try:
        group = session.get(GroupClass, group_id)
        if not group:
            raise HTTPException(
                status_code=404, detail="Групповое занятие не найдено"
            )

        group.name = group_data.name
        group.duration = group_data.duration
        group.description = group_data.description
        group.price = group_data.price
        session.commit()
    except Exception as e:
        session.rollback()
        raise e


@router.get("/api/admin/times")
async def return_timeslots_endpoint(
    session: SessionDep,
    trainer_id: int = Query(..., description="ID тренера"),
    date: str = Query(..., description="Дата записи"),
):
    query = (
        select(
            TimeSlot.id.label("timeslot_id"),
            Trainer.name.label("trainer_name"),
            Service.name.label("service_name"),
            GroupClass.name.label("group_name"),
            TimeSlot.dates.label("date"),
            TimeSlot.times.label("time"),
            TimeSlot.available.label("status"),
            TimeSlot.available_spots.label("available_spots"),
        )
        .join(Trainer, TimeSlot.trainer_id == Trainer.id)
        .join(Service, TimeSlot.service_id == Service.id, isouter=True)
        .join(
            GroupClass, TimeSlot.group_class_id == GroupClass.id, isouter=True
        )
    )

    if trainer_id:
        query = query.where(TimeSlot.trainer_id == trainer_id)
    if date:
        query = query.where(TimeSlot.dates == date)

    time_slots = session.exec(query).all()

    return [
        {
            "timeslot_id": ts.timeslot_id,
            "trainer_name": ts.trainer_name or "Тренер не указан",
            "service_name": ts.service_name or None,
            "group_name": ts.group_name or None,
            "date": ts.date if ts.date else "Дата не указана",
            "time": ts.time if ts.time else "Время не указано",
            "status": ts.status or False,
            "available_spots": ts.available_spots or 0,
        }
        for ts in time_slots
    ]


@router.get("/api/admin/time/{time_id}")
async def get_time_endpoint(
    time_id: int, session: Session = Depends(db.get_session)
):
    time = session.get(TimeSlot, time_id)
    if not time:
        raise HTTPException(status_code=404, detail="Временной слот не найден")
    return time


@router.post("/api/admin/time/add")
async def add_time_endpoint(session: SessionDep, time: TimeSlotRequest):
    try:
        dates = datetime.strptime(time.date, "%Y-%m-%d").date()
        times = datetime.strptime(time.time, "%H:%M").time()

        trainer = session.exec(
            select(Trainer).where(Trainer.name == time.trainer_name)
        ).first()
        if not trainer:
            raise HTTPException(
                status_code=400,
                detail=f"Тренер '{time.trainer_name}' не найден",
            )

        service = None
        if time.service_name:
            service = session.exec(
                select(Service).where(Service.name == time.service_name)
            ).first()
            if not service:
                raise HTTPException(
                    status_code=400,
                    detail=f"Услуга '{time.service_name}' не найдена",
                )

        group_class = None
        if time.group_name:
            group_class = session.exec(
                select(GroupClass).where(GroupClass.name == time.group_name)
            ).first()
            if not group_class:
                raise HTTPException(
                    status_code=400,
                    detail=f"Групповое занятие '{time.group_name}' не найдено",
                )

        new_time_slot = TimeSlot(
            trainer_id=trainer.id,
            service_id=service.id if service else None,
            group_class_id=group_class.id if group_class else None,
            dates=dates,
            times=times,
            available=time.status,
            available_spots=time.available_spots,
        )

        session.add(new_time_slot)
        session.commit()
        session.refresh(new_time_slot)

        return {
            "message": "Временной слот успешно добавлен",
            "time_slot": new_time_slot,
        }

    except Exception as e:
        session.rollback()
        raise e


@router.delete("/api/admin/time/delete/{time_id}")
async def delete_time_endpoint(session: SessionDep, time_id: int):
    try:
        time = session.get(TimeSlot, time_id)
        if not time:
            raise HTTPException(
                status_code=404, detail="Временной слот не найден"
            )
        session.delete(time)
        session.commit()
    except Exception as e:
        session.rollback()
        raise e


@router.put("/api/admin/time/edit/{time_id}")
async def edit_time_endpoint(
    session: SessionDep, time_id: int, time_data: TimeSlotRequest
):
    try:
        time = session.get(TimeSlot, time_id)
        if not time:
            raise HTTPException(
                status_code=404, detail="Временной слот не найден"
            )

        time_data.date = datetime.strptime(time_data.date, "%Y-%m-%d").date()
        time_data.time = datetime.strptime(
            time_data.time + ":00", "%H:%M:%S"
        ).time()

        trainer = session.exec(
            select(Trainer).where(Trainer.name == time_data.trainer_name)
        ).first()
        if not trainer:
            raise HTTPException(
                status_code=400,
                detail=f"Тренер '{time_data.trainer_name}' не найден",
            )

        service = None
        if time_data.service_name:
            service = session.exec(
                select(Service).where(Service.name == time_data.service_name)
            ).first()
            if not service:
                raise HTTPException(
                    status_code=400,
                    detail=f"Услуга '{time_data.service_name}' не найдена",
                )

        group_class = None
        if time_data.group_name:
            group_class = session.exec(
                select(GroupClass).where(
                    GroupClass.name == time_data.group_name
                )
            ).first()
            if not group_class:
                raise HTTPException(
                    status_code=400,
                    detail=f"Групповое занятие '{time_data.group_name}'"
                    f"не найдено",
                )

        time.trainer_id = trainer.id
        time.service_id = service.id if service else None
        time.group_class_id = group_class.id if group_class else None
        time.dates = time_data.date
        time.times = time_data.time
        time.available = time_data.status
        time.available_spots = time_data.available_spots
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
