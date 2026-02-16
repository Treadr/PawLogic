export default function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="error-banner">
      <span>{message}</span>
      {onDismiss && (
        <button className="error-dismiss" onClick={onDismiss}>
          &times;
        </button>
      )}
    </div>
  );
}
