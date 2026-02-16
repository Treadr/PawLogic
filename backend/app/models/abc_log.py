import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ABCLog(Base):
    __tablename__ = "abc_logs"
    __table_args__ = (
        CheckConstraint("behavior_severity BETWEEN 1 AND 5", name="ck_abc_logs_severity"),
        Index("idx_abc_logs_pet_occurred", "pet_id", "occurred_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pet_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Antecedent
    antecedent_category: Mapped[str] = mapped_column(String(50), nullable=False)
    antecedent_tags: Mapped[list[str]] = mapped_column(ARRAY(String(50)), nullable=False)
    antecedent_notes: Mapped[str | None] = mapped_column()

    # Behavior
    behavior_category: Mapped[str] = mapped_column(String(50), nullable=False)
    behavior_tags: Mapped[list[str]] = mapped_column(ARRAY(String(50)), nullable=False)
    behavior_severity: Mapped[int] = mapped_column(Integer, nullable=False)
    behavior_notes: Mapped[str | None] = mapped_column()

    # Consequence
    consequence_category: Mapped[str] = mapped_column(String(50), nullable=False)
    consequence_tags: Mapped[list[str]] = mapped_column(ARRAY(String(50)), nullable=False)
    consequence_notes: Mapped[str | None] = mapped_column()

    # Metadata
    occurred_at: Mapped[datetime] = mapped_column(nullable=False, server_default=text("NOW()"))
    location: Mapped[str | None] = mapped_column(String(100))
    duration_seconds: Mapped[int | None] = mapped_column()
    other_pets_present: Mapped[list[uuid.UUID] | None] = mapped_column(ARRAY(UUID(as_uuid=True)))

    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=text("NOW()"))

    # Relationships
    pet: Mapped["Pet"] = relationship(back_populates="abc_logs")  # noqa: F821
