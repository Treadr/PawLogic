import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, Index, Numeric, String, text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Insight(Base):
    __tablename__ = "insights"
    __table_args__ = (
        CheckConstraint(
            "insight_type IN ('pattern', 'function', 'correlation', 'recommendation')",
            name="ck_insights_type",
        ),
        CheckConstraint(
            "behavior_function IS NULL OR behavior_function IN ('attention', 'escape', 'tangible', 'sensory')",
            name="ck_insights_function",
        ),
        CheckConstraint("confidence BETWEEN 0 AND 1", name="ck_insights_confidence"),
        Index("idx_insights_pet_unread", "pet_id", "is_read"),
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
    )
    insight_type: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    body: Mapped[str] = mapped_column(nullable=False)
    confidence: Mapped[float | None] = mapped_column(Numeric(3, 2))
    abc_log_ids: Mapped[list[uuid.UUID] | None] = mapped_column(ARRAY(UUID(as_uuid=True)))
    behavior_function: Mapped[str | None] = mapped_column(String(20))
    is_read: Mapped[bool] = mapped_column(server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=text("NOW()"))

    # Relationships
    pet: Mapped["Pet"] = relationship(back_populates="insights")  # noqa: F821
