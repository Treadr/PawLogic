import uuid
from datetime import datetime

from sqlalchemy import String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    display_name: Mapped[str | None] = mapped_column(String(100))
    subscription_tier: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default=text("'free'")
    )
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=text("NOW()"))
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=text("NOW()"), onupdate=datetime.now
    )

    # Relationships
    pets: Mapped[list["Pet"]] = relationship(  # noqa: F821
        back_populates="owner", cascade="all, delete-orphan"
    )
