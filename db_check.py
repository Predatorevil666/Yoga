from sqlmodel import Session, create_engine, select
from utils.models import Trainer

engine = create_engine('postgresql://postgres:Worldof123@localhost:5432/services')

try:
    with Session(engine) as session:
        trainers = session.exec(select(Trainer)).all()
        print('Найдено тренеров:', len(trainers))
        for t in trainers:
            print(f'ID: {t.id}, Имя: {t.name}')
    print("Соединение с базой данных успешно!")
except Exception as e:
    print(f"Ошибка при подключении к базе данных: {e}") 