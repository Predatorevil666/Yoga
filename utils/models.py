from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import date, time, datetime
import sqlalchemy as sa


class Booking(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    service_id: Optional[int] = Field(default=None)
    class_id: Optional[int] = Field(default=None)
    trainer_id: Optional[int] = Field(default=None)
    timeslot_id: int = Field(nullable=False)
    dates: str = Field(nullable=False)
    user_name: Optional[str] = Field(default=None)
    user_email: Optional[str] = Field(default=None)
    user_phone: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TrainerService(SQLModel, table=True):
    trainer_id: int = Field(foreign_key="trainer.id", primary_key=True)
    service_id: int = Field(foreign_key="service.id", primary_key=True)


class TrainerGroup(SQLModel, table=True):
    trainer_id: int = Field(foreign_key="trainer.id", primary_key=True)
    group_class_id: int = Field(foreign_key="groupclass.id", primary_key=True)


class Service(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    duration: float | None = Field(default=None)
    description: str | None = Field(default=None)
    price: int | None = Field(default=None, index=True)
    photo: str | None = Field(default=None)
    type: str = Field(index=True)

    time_slots: list["TimeSlot"] = Relationship(back_populates="service")
    trainers: list["Trainer"] = Relationship(
        back_populates="services", link_model=TrainerService)


class Trainer(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str | None = Field(default=None)
    specialization: str = Field(index=True)
    photo: str | None = Field(default=None)

    time_slots: list["TimeSlot"] = Relationship(back_populates="trainer")
    services: list["Service"] = Relationship(
        back_populates="trainers", link_model=TrainerService)
    groups: list["GroupClass"] = Relationship(
        back_populates="trainers", link_model=TrainerGroup)


class TimeSlot(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    trainer_id: int = Field(foreign_key="trainer.id", nullable=False)
    service_id: Optional[int] = Field(default=None, foreign_key="service.id")
    group_class_id: Optional[int] = Field(
        default=None, foreign_key="groupclass.id")
    dates: date = Field(nullable=False)
    times: time = Field(nullable=False)
    available: bool = Field(default=True)
    available_spots: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    trainer: Optional["Trainer"] = Relationship(back_populates="time_slots")
    service: Optional["Service"] = Relationship(back_populates="time_slots")
    group_class: Optional["GroupClass"] = Relationship(
        back_populates="time_slots")


class Branch(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    address: str = Field(nullable=False)
    phone: str = Field(nullable=False)
    workingHours: str = Field(nullable=False)
    description: str = Field(nullable=False)
    photos: List[str] = Field(default=[], sa_column=sa.Column(sa.JSON))


class GroupClass(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    duration: float | None = Field(default=None)
    description: str | None = Field(default=None)
    price: int | None = Field(default=None, index=True)

    trainers: list["Trainer"] = Relationship(
        back_populates="groups", link_model=TrainerGroup)
    time_slots: list["TimeSlot"] = Relationship(back_populates="group_class")
