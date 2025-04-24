from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import SessionLocal
import logging

router = APIRouter(prefix="/contacts", tags=["Contacts"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Contact)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    logging.info(f"[ROUTER] create_contact RAW: {contact}")
    try:
        return crud.create_contact(db, contact)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.Contact])
def read_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_contacts(db, skip=skip, limit=limit)

@router.get("/search/", response_model=List[schemas.Contact])
def search_contacts(query: str, db: Session = Depends(get_db)):
    return crud.search_contacts(db, query)

@router.get("/birthdays/", response_model=List[schemas.Contact])
def get_upcoming_birthdays(db: Session = Depends(get_db)):
    return crud.contacts_with_upcoming_birthdays(db)

@router.get("/{contact_id}", response_model=schemas.Contact)
def read_contact(contact_id: int, db: Session = Depends(get_db)):
    db_contact = crud.get_contact(db, contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact

@router.put("/{contact_id}", response_model=schemas.Contact)
def update_contact(contact_id: int, contact: schemas.ContactUpdate, db: Session = Depends(get_db)):
    logging.info(f"[ROUTER] update_contact RAW: {contact}")
    db_contact = crud.update_contact(db, contact_id, contact)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact

@router.delete("/{contact_id}", response_model=schemas.Contact)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    db_contact = crud.delete_contact(db, contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact
