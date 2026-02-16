import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, Numeric, String, text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Pet(Base):
    __tablename__ = "pets"
    __table_args__ = (
        CheckConstraint("species IN ('cat', 'dog')", name="ck_pets_species"),
        CheckConstraint(
            "sex IN ('male', 'female', 'unknown')", name="ck_pets_sex"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    species: Mapped[str] = mapped_column(String(10), nullable=False)
    breed: Mapped[str | None] = mapped_column(String(100))
    age_years: Mapped[int | None] = mapped_column()
    age_months: Mapped[int | None] = mapped_column()
    weight_lbs: Mapped[float | None] = mapped_column(Numeric(5, 1))
    sex: Mapped[str] = mapped_column(String(10), server_default=text("'unknown'"))
    is_neutered: Mapped[bool] = mapped_column(server_default=text("false"))
    temperament: Mapped[list[str] | None] = mapped_column(ARRAY(String(50)))
    medical_notes: Mapped[str | None] = mapped_column()
    photo_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=text("NOW()")
    )
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=text("NOW()"), onupdate=datetime.now
    )

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="pets")  # noqa: F821
    abc_logs: Mapped[list["ABCLog"]] = relationship(  # noqa: F821
        back_populates="pet", cascade="all, delete-orphan"
    )
    insights: Mapped[list["Insight"]] = relationship(  # noqa: F821
        back_populates="pet", cascade="all, delete-orphan"
    )
